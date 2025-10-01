import { IGenericRepository } from "../common/IGenericRepository";
import { Session } from "./Session";

export interface ISessionRepository extends IGenericRepository<Session> {
    findByUserId(userId: string): Promise<Session[]>
    findByJti(jti: string): Promise<Session | null>
    deactivateAllSessionByUserId(userId: string): Promise<boolean>
    deleteByJti(jti: string): Promise<boolean>
    deleteExpiredSessions(): Promise<number>
}