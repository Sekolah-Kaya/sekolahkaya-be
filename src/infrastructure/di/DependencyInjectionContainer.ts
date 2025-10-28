import { PrismaClient } from "@prisma/client"
import Redis from "ioredis"
import { env } from "../config/env"
import { UserRepository } from "../repository/UserRepository"
import { CourseRepository } from "../repository/CourseRepository"
import { EnrollmentRepository } from "../repository/EnrollmentRepository"
import { LessonRepository } from "../repository/LessonRepository"
import { LessonProgressRepository } from "../repository/LessonProgressRepository"
import { CategoryRepository } from "../repository/CategoryRepository"
import { PaymentRepository } from "../repository/PaymentRepository"
import { ReviewRepository } from "../repository/ReviewRepository"
import { SessionRepository } from "../repository/SessionRepository"
import { BcryptPasswordService } from "../external-services/BcryptPasswordService"
import { RedisCache } from "../external-services/RedisCacheService"
import { SimpleEventDispatcher } from "../external-services/SimpleEventDispatcher"
import { NodeMailerEmailService } from "../external-services/NodeMailerEmailService"
import { UserApplicationService } from "../../application/services/UserApplicationService"
import { CourseApplicationService } from "../../application/services/CourseApplicationService"
import { EnrollmentApplicationService } from "../../application/services/EnrollmentApplicationService"
import { MidtransService } from "../external-services/MidtransService"
import { GoogleYoutubeApiClient } from "../youtube/GoogleYoutubeApiClient"
import { RedisYoutubeCache } from "../youtube/RedisYoutubeCache"
import { InMemoryYoutubeCache } from "../youtube/InMemoryYoutubeCache"
import { YoutubeService } from "../../application/services/YoutubeService"
import { JWTService } from "../../shared/utils/JwtService"
import { SessionService } from "../../application/services/SessionService"
import { AuthService } from "../../application/services/AuthenticationService"
import { AuthenticationMiddleware } from "../../presentation/middleware/Authentication"

export class DIContainer {
    private services: Map<string, any> = new Map()
    private singletons: Map<string, any> = new Map()

    register<T>(key: string, factory: () => T, singleton = false): void {
        if (singleton) {
            this.singletons.set(key, factory)
        } else {
            this.services.set(key, factory)
        }
    }

    get<T>(key: string): T {
        if (this.singletons.has(key)) {
            const factory = this.singletons.get(key)
            if (typeof factory === 'function') {
                const instance = factory()
                this.singletons.set(key, instance)
                return instance
            }
            return factory
        }

        const factory = this.services.get(key)
        if (!factory) {
            throw new Error(`Service ${key} not registered`)
        }

        return factory()
    }

    static bootstrap(): DIContainer {
        const container = new DIContainer()

        container.register('PrismaClient', () => new PrismaClient(), true)
        container.register('Redis', () => new Redis({
            host: env.REDIS_HOST || 'localhost',
            port: parseInt(env.REDIS_PORT || '6379'),
            password: env.REDIS_PASSWORD
        }), true)

        container.register('IUserRepository', () =>
            new UserRepository(container.get('PrismaClient')), true)
        container.register('ICourseRepository', () =>
            new CourseRepository(container.get('PrismaClient')), true)
        container.register('IEnrollmentRepository', () =>
            new EnrollmentRepository(container.get('PrismaClient')), true)
        container.register('ILessonRepository', () =>
            new LessonRepository(container.get('PrismaClient')), true)
        container.register('ILessonProgressRepository', () =>
            new LessonProgressRepository(container.get('PrismaClient')), true)
        container.register('ICategoryRepository', () =>
            new CategoryRepository(container.get('PrismaClient')), true)
        container.register('IPaymentRepository', () =>
            new PaymentRepository(container.get('PrismaClient')), true)
        container.register('IReviewRepository', () =>
            new ReviewRepository(container.get('PrismaClient')), true)
        container.register('ISessionRepository', () =>
            new SessionRepository(container.get('PrismaClient')), true)

        container.register('IPasswordService', () => new BcryptPasswordService(), true)
        container.register('ICacheService', () =>
            new RedisCache(container.get('Redis')), true)
        container.register('IEventDispatcher', () => new SimpleEventDispatcher(), true)
        container.register('IEmailService', () =>
            new NodeMailerEmailService({
                host: env.SMTP_HOST!,
                port: parseInt(env.SMTP_PORT!),
                secure: env.SMTP_SECURE === 'true',
                auth: {
                    user: env.SMTP_USER!,
                    pass: env.SMTP_PASS!
                },
                from: env.SMTP_FROM_ADDRESS!
            }), true)

        container.register('IPaymentService', () =>
            new MidtransService(
                {
                    serverKey: env.MIDTRANS_SERVER_KEY!,
                    clientKey: env.MIDTRANS_CLIENT_KEY!,
                    isProduction: env.MIDTRANS_IS_PRODUCTION === 'true',
                    snapUrl: env.MIDTRANS_SNAP_URL!,
                    apiUrl: env.MIDTRANS_API_URL!
                },
                container.get('IPaymentRepository')
            ), true)

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
            ), true)

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

        container.register('JWTConfig', () => ({
            accessTokenSecret: env.JWT_ACCESS_SECRET || 'access-secret-change-in-production',
            refreshTokenSecret: env.JWT_REFRESH_SECRET || 'refresh-secret-change-in-production',
            accessTokenExpiry: env.JWT_ACCESS_EXPIRY || '15m',
            refreshTokenExpiry: env.JWT_REFRESH_EXPIRY || '7d',
            issuer: env.JWT_ISSUER || 'lms-platform'
        }), true)

        container.register('IYoutubeApiClient', () => {
            if (!env.YOUTUBE_API_KEY) {
                console.warn('⚠️  YOUTUBE_API_KEY not configured - YouTube features will be disabled')
                return null as any
            }
            console.log('✅ YouTube API Client initialized')
            return new GoogleYoutubeApiClient(env.YOUTUBE_API_KEY)
        }, true)

        container.register('IYouTubeCache', () => {
            try {
                const redis = container.get<Redis>('Redis')
                if (redis && redis.status === 'ready') {
                    console.log('✅ Using Redis cache for YouTube data')
                    return new RedisYoutubeCache(redis)
                }
            } catch (error) {
                console.warn('⚠️  Redis not available, falling back to in-memory cache')
            }

            console.log('ℹ️  Using in-memory cache for YouTube data')
            return new InMemoryYoutubeCache()
        }, true)

        container.register('IYouTubeService', () => {
            return new YoutubeService(
                container.get('IYoutubeApiClient'),
                container.get('IYouTubeCache')
            )
        }, true)

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

        container.register('AuthenticationMiddleware', () =>
            new AuthenticationMiddleware(
                container.get('IAuthenticationService'),
                container.get('JWTService')
            ), true)

        return container
    }
}