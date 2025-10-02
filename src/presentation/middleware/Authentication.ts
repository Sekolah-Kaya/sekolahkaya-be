import { NextFunction, Request, Response } from "express";
import { JWTService } from "../../shared/utils/JwtService";
import { Role } from "../../shared/types/Enum";
import { IAuthService } from "../../application/services/AuthenticationService";

export class AuthenticationMiddleware {
    public constructor(
        readonly authService: IAuthService,
        public jwtService: JWTService
    ) { }

    authenticate() {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const token = this.extractToken(req)
                if (!token) {
                    res.status(401).json({
                        success: false,
                        error: 'No authentication token provided'
                    })

                    return
                }

                const result = await this.authService.validateToken(token)
                if (!result.success || !result.data) {
                    res.status(401).json({
                        success: false,
                        error: result.error || 'Invalid token'
                    });
                    return;
                }

                req.user = {
                    id: result.data.userId,
                    email: result.data.email,
                    role: result.data.role,
                    firstName: '',
                    lastName: ''
                }

                next()
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Authentication error'
                });
            }
        }
    }

    requireRole(...roles: Role[]) {
        return (req: Request, res: Response, next: NextFunction): void => {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }

            if (!roles.includes(req.user.role)) {
                res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions'
                });
                return;
            }

            next()
        }
    }

    optional() {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const token = this.extractToken(req)
                if (!token) {
                    next()
                    return
                }

                const result = await this.authService.validateToken(token)
                if (result.success && result.data) {
                    req.user = {
                        id: result.data.userId,
                        email: result.data.email,
                        role: result.data.role,
                        firstName: '',
                        lastName: ''
                    };
                }

                next()
            } catch (error) {
                next()
            }
        }
    }

    private extractToken(req: Request): string | null {
        const authHeader = req.headers.authorization
        if (!authHeader) return null

        const parts = authHeader.split(' ')
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null
        }

        return parts[1]
    }
}