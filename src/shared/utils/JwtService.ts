import jwt, { SignOptions } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { Role } from '../types/Enum'

export interface JWTPayload {
    userId: string
    email: string
    role: Role
    jti: string
    iat?: number
    exp?: number
}

export interface JWTConfig {
    accessTokenSecret: string
    refreshTokenSecret: string
    accessTokenExpiry: string
    refreshTokenExpiry: string
    issuer: string
}

export class JWTService {
    public constructor(readonly config: JWTConfig) {}

    generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
        return jwt.sign(payload, this.config.accessTokenSecret, {
            expiresIn: this.config.accessTokenExpiry,
            issuer: this.config.issuer
        } as SignOptions)
    }

    generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
        return jwt.sign(payload, this.config.refreshTokenSecret, {
            expiresIn: this.config.refreshTokenExpiry,
            issuer: this.config.issuer
        } as SignOptions)
    }

    verifyAccessToken(token: string): JWTPayload | null {
        try {
            return jwt.verify(token, this.config.accessTokenSecret, {
                issuer: this.config.issuer
            }) as JWTPayload
        } catch (error) {
            return null
        }
    }

    verifyRefreshToken(token: string): JWTPayload | null {
        try {
            return jwt.verify(token, this.config.refreshTokenSecret, {
                issuer: this.config.issuer
            }) as JWTPayload
        } catch (error) {
            return null
        }
    }

    decodeToken(token: string): JWTPayload | null {
        try {
            return jwt.decode(token) as JWTPayload
        } catch (error) {
            return null
        }
    }
}