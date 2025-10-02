import { PrismaClient } from "@prisma/client"
import { DIContainer } from "./DependencyInjectionContainer"
import Redis from "ioredis"
import { env } from "../config/env"
import { UserRepository } from "../repository/UserRepository"
import { CourseRepository } from "../repository/CourseRepository"
import { EnrollmentRepository } from "../repository/EnrollmentRepository"
import { LessonProgressRepository } from "../repository/LessonProgressRepository"
import { SessionRepository } from "../repository/SessionRepository"
import { CategoryRepository } from "../repository/CategoryRepository"
import { LessonRepository } from "../repository/LessonRepository"
import { PaymentRepository } from "../repository/PaymentRepository"
import { ReviewRepository } from "../repository/ReviewRepository"
import { BcryptPasswordService } from "../external-services/BcryptPasswordService"
import { SimpleEventDispatcher } from "../external-services/SimpleEventDispatcher"
import { RedisCache } from "../external-services/RedisCacheService"
import { NodeMailerEmailService } from "../external-services/NodeMailerEmailService"
import { JWTService } from "../../shared/utils/JwtService"
import { SessionService } from "../../application/services/SessionService"
import { AuthenticationMiddleware } from "../../presentation/middleware/Authentication"
import { AuthService } from "../../application/services/AuthenticationService"
import { UserApplicationService } from "../../application/services/UserApplicationService"
import { CourseApplicationService } from "../../application/services/CourseApplicationService"
import { EnrollmentApplicationService } from "../../application/services/EnrollmentApplicationService"
import { MidtransService } from "../external-services/MidtransService"

export class ExtendedDIContainer extends DIContainer {
    static bootstrap(): ExtendedDIContainer {
        const container = new ExtendedDIContainer()

        // Infrastructure
        container.register('PrismaClient', () => new PrismaClient(), true)
        container.register('Redis', () => new Redis({
            host: env.REDIS_HOST || 'localhost',
            port: parseInt(env.REDIS_PORT || '6379'),
            password: env.REDIS_PASSWORD
        }), true)

        // JWT Configuration
        container.register('JWTConfig', () => ({
            accessTokenSecret: env.JWT_ACCESS_SECRET || 'access-secret-change-in-production',
            refreshTokenSecret: env.JWT_REFRESH_SECRET || 'refresh-secret-change-in-production',
            accessTokenExpiry: env.JWT_ACCESS_EXPIRY || '15m',
            refreshTokenExpiry: env.JWT_REFRESH_EXPIRY || '7d',
            issuer: env.JWT_ISSUER || 'lms-platform'
        }), true)

        // Repositories
        container.register('IUserRepository', () =>
            new UserRepository(container.get('PrismaClient')), true)
        container.register('ICourseRepository', () =>
            new CourseRepository(container.get('PrismaClient')), true)
        container.register('IEnrollmentRepository', () =>
            new EnrollmentRepository(container.get('PrismaClient')), true)
        container.register('ILessonProgressRepository', () =>
            new LessonProgressRepository(container.get('PrismaClient')), true)
        container.register('ISessionRepository', () =>
            new SessionRepository(container.get('PrismaClient')), true)
        container.register('ICategoryRepository', () =>
            new CategoryRepository(container.get('PrismaClient')), true)
        container.register('ILessonRepository', () =>
            new LessonRepository(container.get('PrismaClient')), true)
        container.register('IPaymentRepository', () =>
            new PaymentRepository(container.get('PrismaClient')), true)
        container.register('IReviewRepository', () =>
            new ReviewRepository(container.get('PrismaClient')), true)

        // External Services
        container.register('IPasswordService', () => new BcryptPasswordService(), true)
        container.register('ICacheService', () =>
            new RedisCache(container.get('Redis')), true)
        container.register('IEventDispatcher', () => new SimpleEventDispatcher(), true)
        container.register('IEmailService', () =>
            new NodeMailerEmailService({
                host: env.SMTP_HOST || 'localhost',
                port: parseInt(env.SMTP_PORT || '587'),
                secure: env.SMTP_SECURE === 'true',
                auth: {
                    user: env.SMTP_USER || 'user',
                    pass: env.SMTP_PASS || 'pass'
                },
                from: env.SMTP_FROM_ADDRESS || 'noreply@lms.com'
            }), true)

        // Payment Service - ADDED
        container.register('IPaymentService', () =>
            new MidtransService(
                {
                    serverKey: env.MIDTRANS_SERVER_KEY!,
                    clientKey: env.MIDTRANS_CLIENT_KEY!,
                    isProduction: env.MIDTRANS_IS_PRODUCTION === 'true',
                    snapUrl: env.MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/v1',
                    apiUrl: env.MIDTRANS_API_URL || 'https://api.sandbox.midtrans.com/v2'
                },
                container.get('IPaymentRepository')
            ), true)

        // JWT & Auth Services
        container.register('JWTService', () =>
            new JWTService(container.get('JWTConfig')), true)
        container.register('ISessionService', () =>
            new SessionService(
                container.get('ISessionRepository'),
                container.get('JWTConfig')
            ), true)
        container.register('IAuthenticationService', () =>
            new AuthService(
                container.get('IUserRepository'),
                container.get('ISessionService'),
                container.get('IPasswordService'),
                container.get('JWTService')
            ), true)

        // Middleware
        container.register('AuthenticationMiddleware', () =>
            new AuthenticationMiddleware(
                container.get('IAuthenticationService'),
                container.get('JWTService')
            ), true)

        // Application Services
        container.register('IUserApplicationService', () =>
            new UserApplicationService(
                container.get('IUserRepository'),
                container.get('IPasswordService'),
                container.get('IEmailService'),
                container.get('IEventDispatcher')
            ), true)

        container.register('ICourseApplicationService', () =>
            new CourseApplicationService(
                container.get('ICourseRepository'),
                container.get('IUserRepository'),
                container.get('ICategoryRepository'),
                container.get('IEventDispatcher'),
                container.get('ICacheService')
            ), true) // FIXED: correct dependencies

        container.register('IEnrollmentApplicationService', () =>
            new EnrollmentApplicationService(
                container.get('IEnrollmentRepository'),
                container.get('ICourseRepository'),
                container.get('IUserRepository'),
                container.get('ILessonRepository'),
                container.get('ILessonProgressRepository'),
                container.get('IPaymentService'),
                container.get('IEventDispatcher'),
                container.get('IEmailService')
            ), true)

        return container
    }
}