import { Request, Response } from "express"
import { IAuthService, LoginCommand } from "../../application/AuthenticationService"
import { BaseController } from "./BaseController"
import { RequestValidator, ValidationRule } from "../../middleware/ValidationRule"
import { Role } from "../../domain/common/enum"
import { RegisterUserCommand } from "../../domain/user/UserDTO"
import { IUserApplicationService } from "../../domain/user/IUserApplicationService"

export class AuthController extends BaseController {
    public constructor(
        readonly authService: IAuthService,
        readonly userService: IUserApplicationService
    ) {
        super()
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const validationRules: ValidationRule[] = [
                {
                    field: 'email',
                    rules: [
                        { type: 'required' },
                        { type: 'email' }
                    ]
                },
                {
                    field: 'password',
                    rules: [{ type: 'required' }]
                }
            ]

            const validationErrors = RequestValidator.validate(req.body, validationRules)
            if (Object.keys(validationErrors).length > 0) {
                this.sendValidationError(res, validationErrors)
                return
            }

            const command: LoginCommand = {
                email: req.body.email,
                password: req.body.password,
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip
            }

            const result = await this.authService.login(command)
            if (result.success) {
                this.sendSuccess(res, result.data, 'Login successful')
            } else {
                this.sendError(res, result.error!, 401)
            }
        } catch (error) {
            this.sendError(res, 'Login failed', 500)
        }
    }

    async register(req: Request, res: Response): Promise<void> {
        try {
            const userCommand: RegisterUserCommand = {
                email: req.body.email,
                password: req.body.password,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                phone: req.body.phone,
                role: req.body.role || Role.STUDENT
            }


            const userResult = await this.userService.registerUser(userCommand)
            if (!userResult.success) {
                this.sendError(res, userResult.error!)
                return
            }

            const loginCommand: LoginCommand = {
                email: req.body.email,
                password: req.body.password,
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip
            }

            const loginResult = await this.authService.login(loginCommand)

            if (loginResult.success) {
                this.sendSuccess(res, loginResult.data, 'Registration successful', 201)
            } else {
                this.sendSuccess(res, { user: userResult.data }, 'Registration successful. Please login.', 201)
            }
        } catch (error) {
            this.sendError(res, 'Registration failed', 500)
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        try {
            const jti = req.user?.jti

            if (!jti) {
                this.sendError(res, 'Invalid session', 400)
                return
            }

            const result = await this.authService.logout(jti)

            if (result.success) {
                this.sendSuccess(res, null, 'Logout successful')
            } else {
                this.sendError(res, result.error!)
            }
        } catch (error) {
            this.sendError(res, 'Logout failed', 500)
        }
    }

    async logoutAll(req: Request, res: Response): Promise<void> {
        try {
            const userId = this.getUserId(req)
            const result = await this.authService.logoutAllSession(userId)

            if (result.success) {
                this.sendSuccess(res, { sessionsRevoked: result.data }, 'All sessions logged out')
            } else {
                this.sendError(res, result.error!)
            }
        } catch (error) {
            this.sendError(res, 'Logout all failed', 500)
        }
    }

    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body

            if (!refreshToken) {
                this.sendError(res, 'Refresh token required', 400)
                return
            }

            const result = await this.authService.refreshToken(
                refreshToken,
                req.headers['user-agent'],
                req.ip
            )

            if (result.success) {
                this.sendSuccess(res, result.data, 'Token refreshed')
            } else {
                this.sendError(res, result.error!, 401)
            }
        } catch (error) {
            this.sendError(res, 'Token refresh failed', 500)
        }
    }

    async getMe(req: Request, res: Response): Promise<void> {
        try {
            const userId = this.getUserId(req)
            const result = await this.userService.getUserById(userId)

            if (result.success) {
                const user = result.data!
                this.sendSuccess(res, {
                    id: user.id,
                    email: user.email.getValue(),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    isActive: user.isActive
                })
            } else {
                this.sendNotFound(res, 'User')
            }
        } catch (error) {
            this.sendError(res, 'Failed to get user info', 500)
        }
    }
}