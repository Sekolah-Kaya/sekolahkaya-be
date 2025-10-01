import { Request, Response } from 'express'
import { Role } from '../../domain/common/enum'

export abstract class BaseController {
    protected sendSuccess<T>(res: Response, data?: T, message?: string, statusCode = 200 ): void {
        res.status(statusCode).json({
            success: true,
            message: message || 'Operation Successful',
            data
        })
    }

    protected sendError(res: Response, error: string, statusCode = 400, details?: any): void {
        res.status(statusCode).json({
            success: false,
            error,
            details
        })
    }

    protected sendValidationError(res: Response, errors: Record<string, string[]>): void {
        res.status(422).json({
            success: false,
            error: 'Validation failed',
            validationErrors: errors
        })
    }

    protected sendNotFound(res: Response, resource = 'Resource'): void {
        res.status(404).json({
            success: false,
            error: `${resource} not found`
        })
    }

    protected sendUnauthorized(res: Response, message = 'Unauthorized'): void {
        res.status(401).json({
            success: false,
            error: message
        })
    }

    protected sendForbidden(res: Response, message = 'Forbidden'): void {
        res.status(403).json({
            success: false,
            error: message
        })
    }

    protected getUserId(req: Request): string {
        return req.user?.id || ''
    }

    protected getUserRole(req: Request): Role {
        return req.user?.role || Role.STUDENT
    }
}