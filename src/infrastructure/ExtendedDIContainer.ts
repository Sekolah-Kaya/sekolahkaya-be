import { PrismaClient } from "@prisma/client";
import { DIContainer } from "./DependencyInjectionContainer";
import Redis from "ioredis";
import { env } from "../config/env";
import { UserRepository } from "./database/repository/UserRepository";
import { CourseRepository } from "./database/repository/CourseRepository";
import { EnrollmentRepository } from "./database/repository/EnrollmentRepository";
import { LessonProgressRepository } from "./database/repository/LessonProgressRepository";
import { SessionRepository } from "./database/repository/SessionRepository";
import { CategoryRepository } from "./database/repository/CategoryRepository";
import { LessonRepository } from "./database/repository/LessonRepository";
import { BcryptPasswordService } from "./service/BcryptPasswordService";
import { SimpleEventDispatcher } from "./service/SimpleEventDispatcher";
import { RedisCache } from "./service/RedisCacheService";
import { NodeMailerEmailService } from "./service/NodeMailerEmailService";
import { JWTService } from "../utils/JwtService";
import { SessionService } from "../application/SessionService";
import { AuthService } from "../application/AuthenticationService";
import { AuthenticationMiddleware } from "../middleware/Authentication";
import { UserApplicationService } from "../application/UserApplicationService";
import { CourseApplicationService } from "../application/CourseApplicationService";
import { EnrollmentApplicationService } from "../application/EnrollmentApplicationService";

export class ExtendedDIContainer extends DIContainer {
    static bootstrap(): ExtendedDIContainer {
        const container = new ExtendedDIContainer();

        // Infrastructure
        container.register('PrismaClient', () => new PrismaClient(), true);
        container.register('Redis', () => new Redis({
            host: env.REDIS_HOST || 'localhost',
            port: parseInt(env.REDIS_PORT || '6379'),
            password: env.REDIS_PASSWORD
        }), true);

        // JWT Configuration
        container.register('JWTConfig', () => ({
            accessTokenSecret: env.JWT_ACCESS_SECRET || 'access-secret-change-in-production',
            refreshTokenSecret: env.JWT_REFRESH_SECRET || 'refresh-secret-change-in-production',
            accessTokenExpiry: env.JWT_ACCESS_EXPIRY || '15m',
            refreshTokenExpiry: env.JWT_REFRESH_EXPIRY || '7d',
            issuer: env.JWT_ISSUER || 'lms-platform'
        }), true);

        // Repositories
        container.register('IUserRepository', () =>
            new UserRepository(container.get('PrismaClient')), true);
        container.register('ICourseRepository', () =>
            new CourseRepository(container.get('PrismaClient')), true);
        container.register('IEnrollmentRepository', () =>
            new EnrollmentRepository(container.get('PrismaClient')), true);
        container.register('ILessonProgressRepository', () =>
            new LessonProgressRepository(container.get('PrismaClient')), true);
        container.register('ISessionRepository', () =>
            new SessionRepository(container.get('PrismaClient')), true);
        container.register('ICategoryRepository', () =>
            new CategoryRepository(container.get('PrismaClient')), true);
        container.register('ILessonRepository', () =>
            new LessonRepository(container.get('PrismaClient')), true);

        // External Services
        container.register('IPasswordService', () => new BcryptPasswordService(), true);
        container.register('ICacheService', () =>
            new RedisCache(container.get('Redis')), true);
        container.register('IEventDispatcher', () => new SimpleEventDispatcher(), true);
        container.register('IEmailService', () =>
            new NodeMailerEmailService({
                host: process.env.SMTP_HOST || 'localhost',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER || 'user',
                    pass: process.env.SMTP_PASS || 'pass'
                },
                from: process.env.FROM_EMAIL || 'noreply@lms.com'
            }), true);

        // JWT & Auth Services
        container.register('JWTService', () =>
            new JWTService(container.get('JWTConfig')), true);
        container.register('ISessionService', () =>
            new SessionService(
                container.get('ISessionRepository'),
                container.get('JWTConfig')
            ), true);
        container.register('IAuthenticationService', () =>
            new AuthService(
                container.get('IUserRepository'),
                container.get('ISessionService'),
                container.get('IPasswordService'),
                container.get('JWTService')
            ), true);

        // Middleware
        container.register('AuthenticationMiddleware', () =>
            new AuthenticationMiddleware(
                container.get('IAuthenticationService'),
                container.get('JWTService')
            ), true);

        // Application Services
        container.register('IUserApplicationService', () =>
            new UserApplicationService(
                container.get('IUserRepository'),
                container.get('IPasswordService'),
                container.get('IEmailService'),
                container.get('IEventDispatcher')
            ), true);

        container.register('ICourseApplicationService', () =>
            new CourseApplicationService(
                container.get('ICourseRepository'),
                container.get('IUserRepository'),
                container.get('ICategoryRepository'),
                container.get('IEventDispatcher'),
                container.get('ICacheService')
            ), true);

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
            ), true);

        return container;
    }
}