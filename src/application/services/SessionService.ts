import { Session } from "../../domain/models/Session";
import { ISessionRepository } from "../../infrastructure/repository/SessionRepository";
import { JWTConfig } from "../../shared/utils/JwtService";

export interface ISessionService {
    createSession(userId: string, userAgent?: string, ipAddress?: string): Promise<Session>
    validateSession(jti: string, userAgent?: string, ipAddress?: string): Promise<boolean>
    revokeSession(jti: string): Promise<boolean>
    revokeAllUserSessions(userId: string): Promise<number>
    getUserActiveSessions(userId: string): Promise<Session[]>
    cleanupExpiredSessions(): Promise<number>
}

export class SessionService implements ISessionService {
    public constructor(
        readonly sessionRepository: ISessionRepository,
        readonly jwtConfig: JWTConfig
    ) {}

    async createSession(userId: string, userAgent?: string, ipAddress?: string): Promise<Session> {
        const jti = crypto.randomUUID()
        const expiresAt = this.calculateExpiryDate(this.jwtConfig.refreshTokenExpiry)

        const session = Session.create({
            userId,
            jti,
            userAgent,
            ipAddress,
            expiresAt,
        })

        return this.sessionRepository.create(session)
    }

    async validateSession(jti: string, userAgent?: string, ipAddress?: string): Promise<boolean> {
        const session = await this.sessionRepository.findByJti(jti)
        if (!session) return false
        if (!session.isValid) return false
        if (!session.matchesRequest(userAgent, ipAddress)) {
            console.warn(`Session mismatch detected for JTI: ${jti}`)
            return false
        }

        return true
    }

    async revokeSession(jti: string): Promise<boolean> {
        const session = await this.sessionRepository.findByJti(jti)
        if (!session) return false

        session.revoke()
        await this.sessionRepository.update(session.id, session)
        return true
    }

    async revokeAllUserSessions(userId: string): Promise<number> {
        const sessions = await this.sessionRepository.findByUserId(userId)
        let revokedCount = 0

        for (const session of sessions) {
            if (session.isActive) {
                session.revoke()
                await this.sessionRepository.update(session.id, session)
                revokedCount++
            }
        }

        return revokedCount
    }

    async getUserActiveSessions(userId: string): Promise<Session[]> {
        const sessions = await this.sessionRepository.findByUserId(userId)
        return sessions.filter(session => session.isValid())
    }

    async cleanupExpiredSessions(): Promise<number> {
        return this.sessionRepository.deleteExpiredSessions()
    }

    private calculateExpiryDate(expiry: string): Date {
        const now = new Date()
        const match = expiry.match(/^(\d+)([smhd])$/)

        if (!match) {
            throw new Error('Invalid expiry format')
        }

        const value = parseInt(match[1])
        const unit = match[2]

        switch (unit) {
            case 's': return new Date(now.getTime() + value * 1000)
            case 'm': return new Date(now.getTime() + value * 60 * 1000)
            case 'h': return new Date(now.getTime() + value * 60 * 60 * 1000)
            case 'd': return new Date(now.getTime() + value + 24 * 60 * 60 * 1000)
            default: throw new Error('Invalid time unit')
        }
    }
}