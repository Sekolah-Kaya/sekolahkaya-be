export type CreateSessionDTO = {
    userId: string,
    jti: string,
    isActive: boolean,
    expiresAt: Date,
    userAgent?: string,
    ipAddress?: string,
}

export type UpdateSessionDTO = {
    isActive: boolean
}