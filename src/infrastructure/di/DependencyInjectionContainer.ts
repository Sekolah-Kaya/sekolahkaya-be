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
            throw new Error(`Service ${key} not registered`) // FIXED: template literal
        }

        return factory()
    }

    static bootstrap(): DIContainer {
        const container = new DIContainer()

        // Infrastructure
        container.register('PrismaClient', () => new PrismaClient(), true)
        container.register('Redis', () => new Redis({
            host: env.REDIS_HOST || 'localhost',
            port: parseInt(env.REDIS_PORT || '6379'),
            password: env.REDIS_PASSWORD
        }), true)

        // Repositories
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
            new ReviewRepository(container.get('PrismaClient')), true) // FIXED: typo PrisamClient
        container.register('ISessionRepository', () =>
            new SessionRepository(container.get('PrismaClient')), true)

        // External Services
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
        
        // Payment Service - ADDED
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
            ), true) // FIXED: dependencies

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