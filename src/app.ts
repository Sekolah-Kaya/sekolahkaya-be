import express, { Application, Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import { env } from './infrastructure/config/env'
import swaggerSpec from './infrastructure/config/swagger'
import { DIContainer } from './infrastructure/di/DependencyInjectionContainer'
import { createAuthRoutes } from './presentation/routes/AuthRoutes'
import { createUserRoutes } from './presentation/routes/UserRoutes'
import { createCourseRoutes } from './presentation/routes/CourseRoutes'
import { createEnrollmentRoutes } from './presentation/routes/EnrollmentRoutes'
import { createYoutubeRoutes } from './presentation/routes/YoutubeRoutes'

export class AppError extends Error {
    public constructor(
        public message: string,
        public statusCode: number = 500,
        public isOperational: boolean = true
    ) {
        super(message)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor)
    }
}

export class ValidationError extends AppError {
    public constructor(
        message: string,
        public errors: Record<string, string[]>
    ) {
        super(message, 422)
    }
}

export class NotFoundError extends AppError {
    public constructor(resource: string = 'Resource') {
        super(`${resource} not found`, 404)
    }
}

export class UnauthorizedError extends AppError {
    public constructor(message: string = 'Unauthorized') {
        super(message, 401)
    }
}

export class ForbiddenError extends AppError {
    public constructor(message: string = 'Forbidden') {
        super(message, 403)
    }
}

export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false,
            error: error.message,
            ...(error instanceof ValidationError && { validationErrors: error.errors })
        });
        return;
    }

    console.error('Unexpected Error:', error)

    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : error.message
    });
}

export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`
    })
}

export interface AppConfig {
    port: number,
    nodeEnv: string,
    corsOrigin: string[],
    rateLimitWindowsMs: number,
    rateLimitMax: number
}

export function loadConfig(): AppConfig {
    return {
        port: env.PORT,
        nodeEnv: env.NODE_ENV,
        corsOrigin: env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
        rateLimitWindowsMs: parseInt(env.RATE_LIMIT_WINDOW_MS || '900000'),
        rateLimitMax: parseInt(env.RATE_LIMIT_MAX || '100')
    }
}

export function createApp(container: DIContainer, config: AppConfig): any {
    const app = express()

    app.use(helmet())
    app.use(cors({
        origin: config.corsOrigin,
        credentials: true,
    }))

    const limiter = rateLimit({
        windowMs: config.rateLimitWindowsMs,
        max: config.rateLimitMax,
        message: {
            success: false,
            error: 'Too many requests, please try again'
        }
    })

    app.use('/api', limiter)

    app.use(express.json({ limit: '10mb' }))
    app.use(express.urlencoded({ extended: true, limit: '10mb' }))

    if (config.nodeEnv === 'development') {
        app.use(morgan('dev'))
    } else {
        app.use(morgan('combined'))
    }

    app.get('/health', (req, res) => {
        res.json({
            success: true,
            message: 'Server is healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });

    app.use('/api/auth', createAuthRoutes(container));
    app.use('/api/users', createUserRoutes(container));
    app.use('/api/courses', createCourseRoutes(container));
    app.use('/api/enrollments', createEnrollmentRoutes(container));
    app.use('/api/youtube', createYoutubeRoutes(container))

    app.use(notFoundHandler);

    app.use(errorHandler);

    return app;
}