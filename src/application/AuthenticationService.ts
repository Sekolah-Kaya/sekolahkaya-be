import { read } from "fs"
import { Role } from "../domain/common/enum"
import { ApplicationResult } from "../domain/common/ResultObject"
import { IUserRepository } from "../domain/user/IUserRepository"
import { JWTPayload, JWTService } from "../utils/JwtService"
import { ISessionService } from "./SessionService"
import { IPasswordService } from "./PasswordService"

export interface LoginCommand {
    email: string
    password: string
    userAgent?: string
    ipAddress?: string
}

export interface LoginResult {
    accessToken: string
    refreshToken: string
    user: {
        id: string
        email: string
        firstName: string
        lastName: string
        role: Role
    }
}

export interface IAuthService {
    login(command: LoginCommand): Promise<ApplicationResult<LoginResult>>
    logout(jti: string): Promise<ApplicationResult<boolean>>
    logoutAllSession(userId: string): Promise<ApplicationResult<number>>
    refreshToken(refreshToken: string, userAgent?: string, ipAddress?: string): Promise<ApplicationResult<LoginResult>>
    validateToken(accessToken: string): Promise<ApplicationResult<JWTPayload>>
}

export class AuthService implements IAuthService {
    public constructor(
        readonly userRepository: IUserRepository,
        readonly sessionService: ISessionService,
        readonly passwordService: IPasswordService,
        readonly jwtService: JWTService
    ) { }

    async login(command: LoginCommand): Promise<ApplicationResult<LoginResult>> {
        try {
            const user = await this.userRepository.findByEmail(command.email)
            if (!user) {
                return {
                    success: false,
                    error: 'Invalid credentials'
                }
            }

            if (!user.isActive) {
                return {
                    success: false,
                    error: 'Account is deactivated'
                }
            }

            const isValidPassword = await this.passwordService.verify(
                command.password,
                user.passwordHash
            )

            if (!isValidPassword) {
                return {
                    success: false,
                    error: 'Invalid credentials'
                };
            }

            const session = await this.sessionService.createSession(user.id, command.userAgent, command.ipAddress)

            const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
                userId: user.id,
                email: user.email.getValue(),
                role: user.role,
                jti: session.jti
            }

            const accessToken = this.jwtService.generateAccessToken(tokenPayload)
            const refreshToken = this.jwtService.generateRefreshToken(tokenPayload)

            return {
                success: true,
                data: {
                    accessToken,
                    refreshToken,
                    user: {
                        id: user.id,
                        email: user.email.getValue(),
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role
                    }
                }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Login failed'
            }
        }
    }

    async logout(jti: string): Promise<ApplicationResult<boolean>> {
        try {
            const revoked = await this.sessionService.revokeSession(jti)
            return {
                success: revoked,
                data: revoked,
                error: revoked ? undefined : 'Session not found'
            }
        } catch (error) {
            return {
                success: false,
                error: 'Logout failed'
            }
        }
    }

    async logoutAllSession(userId: string): Promise<ApplicationResult<number>> {
        try {
            const count = await this.sessionService.revokeAllUserSessions(userId)
            return {
                success: true,
                data: count
            }
        } catch (error) {
            return {
                success: false,
                error: 'Failed to logout all sessions'
            };
        }
    }

    async refreshToken(refreshToken: string, userAgent?: string, ipAddress?: string): Promise<ApplicationResult<LoginResult>> {
        try {
            const payload = this.jwtService.verifyRefreshToken(refreshToken)
            if (!payload) {
                return {
                    success: false,
                    error: 'Invalid refresh token'
                };
            }

            const isValidSession = await this.sessionService.validateSession(payload.jti, userAgent, ipAddress)
            if (!isValidSession) {
                return {
                    success: false,
                    error: 'Invalid or expired session'
                };
            }

            const user = await this.userRepository.findById(payload.userId);
            if (!user || !user.isActive) {
                return {
                    success: false,
                    error: 'User not found or inactive'
                };
            }

            const newTokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
                userId: user.id,
                email: user.email.getValue(),
                role: user.role,
                jti: payload.jti
            }

            const accessToken = this.jwtService.generateAccessToken(newTokenPayload);
            const newRefreshToken = this.jwtService.generateRefreshToken(newTokenPayload);

            return {
                success: true,
                data: {
                    accessToken,
                    refreshToken: newRefreshToken,
                    user: {
                        id: user.id,
                        email: user.email.getValue(),
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role
                    }
                }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Token refresh failed'
            };
        }
    }

    async validateToken(accessToken: string): Promise<ApplicationResult<JWTPayload>> {
        try {
            const payload = await this.jwtService.verifyAccessToken(accessToken)
            if (!payload) {
                return {
                    success: false,
                    error: 'Invalid token'
                };
            }

            const isValidSession = await this.sessionService.validateSession(payload.jti);
            if (!isValidSession) {
                return {
                    success: false,
                    error: 'Session expired or revoked'
                };
            }

            return {
                success: true,
                data: payload
            };
        } catch (error) {
            return {
                success: false,
                error: 'Token validation failed'
            };
        }
    }
}