import { PrismaClient } from "@prisma/client";
import { ISessionRepository } from "../../../domain/session/ISessionRepository";
import { Session } from "../../../domain/session/Session";

export class SessionRepository implements ISessionRepository {
    public constructor(readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<Session | null> {
        const data = await this.prisma.session.findUnique({
            where: { id }
        })

        return data ? this.toDomain(data) : null
    }

    async findByJti(jti: string): Promise<Session | null> {
        const data = await this.prisma.session.findUnique({
            where: { jti }
        })

        return data ? this.toDomain(data) : null
    }

    async findByUserId(userId: string): Promise<Session[]> {
        const sessions = await this.prisma.session.findMany({
            where: {userId}
        })

        return sessions.map(session => this.toDomain(session))
    }

    async findAll(): Promise<Session[]> {
        const sessions = await this.prisma.session.findMany({
            orderBy: { createdAt: 'desc' }
        })

        return sessions.map(session => this.toDomain(session))
    }

    async create(data: Session): Promise<Session> {
        const sessionData = await this.prisma.session.create({
            data: {
                id: data.id,
                userId: data.userId,
                jti: data.jti,
                isActive: data.isActive,
                userAgent: data.userAgent,
                ipAddress: data.ipAddress,
                expiresAt: data.expiresAt,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
            }
        })

        return this.toDomain(sessionData)
    }

    async update(id: string, data: Partial<Session>): Promise<Session | null> {
        try {
            const sessionData = await this.prisma.session.update({
                where: { id },
                data: {
                    isActive: data.isActive,
                    updatedAt: new Date()
                }
            })

            return this.toDomain(sessionData)
        } catch {
            return null
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            await this.prisma.session.delete({
                where: { id }
            })
            return true
        } catch {
            return false
        }
    }

    async deactivateAllSessionByUserId(userId: string): Promise<boolean> {
        try {
            await this.prisma.session.updateMany({
                where: { userId },
                data: {
                    isActive: false,
                    updatedAt: new Date()
                }
            })
            return true
        } catch {
            return false
        }
    }

    async deleteByJti(jti: string): Promise<boolean> {
        try {
            await this.prisma.session.delete({
                where: { jti }
            })
            return true
        } catch {
            return false
        }
    }

    async deleteExpiredSessions(): Promise<number> {
        const result = await this.prisma.session.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        })

        return result.count        
    }

    private toDomain(sessionData: any): Session {
        return Session.reconstitute({
            id: sessionData.id,
            userId: sessionData.userId,
            jti: sessionData.jti,
            isActive: sessionData.isActive,
            userAgent: sessionData.userAgent,
            ipAddress: sessionData.ipAddress,
            expiresAt: sessionData.expiresAt,
            createdAt: sessionData.createdAt,
            updatedAt: sessionData.updatedAt
        })
    }
}
