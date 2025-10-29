import swaggerJSDoc from 'swagger-jsdoc'
import { env } from './env'
import { authPaths } from './auth.docs'
import { userPaths } from './users.docs'
import { coursePaths } from './courses.docs'
import { enrollmentPaths } from './enrollments.docs'
import { youtubePaths } from './youtube.docs'

const swaggerOptions: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: "Sekolah Kaya API",
            description: "API documentation for Sekolah Kaya",
            version: '1.0.0',
        },
        servers: [
            {
                url: env.BASE_URL || 'localhost:5000',
                description: 'Development Server'
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT Token'
                },
            },
            schemas: {
                YouTubeThumbnails: {
                    type: 'object',
                    properties: {
                        default: { type: 'string', format: 'uri', example: 'https://i.ytimg.com/vi/xxx/default.jpg' },
                        medium: { type: 'string', format: 'uri', example: 'https://i.ytimg.com/vi/xxx/mqdefault.jpg' },
                        high: { type: 'string', format: 'uri', example: 'https://i.ytimg.com/vi/xxx/hqdefault.jpg' },
                        standard: { type: 'string', format: 'uri', example: 'https://i.ytimg.com/vi/xxx/sddefault.jpg' },
                        maxres: { type: 'string', format: 'uri', example: 'https://i.ytimg.com/vi/xxx/maxresdefault.jpg' }
                    }
                },
                YouTubeVideoData: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'dQw4w9WgXcQ' },
                        title: { type: 'string', example: 'Rick Astley - Never Gonna Give You Up' },
                        description: { type: 'string', example: 'The official video for...' },
                        thumbnails: { $ref: '#/components/schemas/YouTubeThumbnails' },
                        duration: { type: 'string', example: '3:33' },
                        durationSeconds: { type: 'integer', example: 213 },
                        channelTitle: { type: 'string', example: 'Rick Astley' },
                        publishedAt: { type: 'string', format: 'date-time' },
                        bestThumbnail: { type: 'string', format: 'uri' }
                    }
                },
                YouTubeVideoResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'object',
                            properties: {
                                type: { type: 'string', enum: ['video'], example: 'video' },
                                data: { $ref: '#/components/schemas/YouTubeVideoData' }
                            }
                        }
                    }
                },
                YouTubePlaylistData: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'PLxxx' },
                        title: { type: 'string', example: 'My Playlist' },
                        description: { type: 'string' },
                        thumbnails: { $ref: '#/components/schemas/YouTubeThumbnails' },
                        channelTitle: { type: 'string', example: 'Channel Name' },
                        videoCount: { type: 'integer', example: 10 },
                        totalDuration: { type: 'string', example: '2h 15m' },
                        videos: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/YouTubeVideoData' }
                        }
                    }
                },
                YouTubePlaylistResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'object',
                            properties: {
                                type: { type: 'string', enum: ['playlist'], example: 'playlist' },
                                data: { $ref: '#/components/schemas/YouTubePlaylistData' }
                            }
                        }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'user-123' },
                        email: { type: 'string', format: 'email', example: 'user@example.com' },
                        firstName: { type: 'string', example: 'John' },
                        lastName: { type: 'string', example: 'Doe' },
                        phone: { type: 'string', nullable: true, example: '+1234567890' },
                        role: { type: 'string', enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'], example: 'STUDENT' },
                        profilePicture: { type: 'string', format: 'uri', nullable: true },
                        isActive: { type: 'boolean', example: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Category: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'category-123' },
                        name: { type: 'string', example: 'Web Development' },
                        description: { type: 'string', nullable: true, example: 'Learn web development' },
                        slug: { type: 'string', example: 'web-development' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Course: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'course-123' },
                        instructorId: { type: 'string', example: 'user-456' },
                        categoryId: { type: 'string', example: 'category-789' },
                        title: { type: 'string', example: 'React for Beginners' },
                        description: { type: 'string', nullable: true, example: 'Learn React from scratch' },
                        price: { type: 'number', example: 99.99 },
                        thumbnail: { type: 'string', format: 'uri', nullable: true },
                        status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], example: 'PUBLISHED' },
                        durationHours: { type: 'integer', example: 10 },
                        level: { type: 'string', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], example: 'BEGINNER' },
                        isFree: { type: 'boolean', example: false },
                        canEnroll: { type: 'boolean', example: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Enrollment: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'enrollment-123' },
                        userId: { type: 'string', example: 'user-456' },
                        courseId: { type: 'string', example: 'course-789' },
                        amountPaid: { type: 'number', example: 99.99 },
                        status: { type: 'string', enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'], example: 'ACTIVE' },
                        enrolledAt: { type: 'string', format: 'date-time' },
                        completedAt: { type: 'string', format: 'date-time', nullable: true },
                        progressPercentage: { type: 'integer', example: 50 },
                        isActive: { type: 'boolean', example: true },
                        isCompleted: { type: 'boolean', example: false },
                        isCancelled: { type: 'boolean', example: false }
                    }
                },
                LessonProgress: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'progress-123' },
                        enrollmentId: { type: 'string', example: 'enrollment-456' },
                        lessonId: { type: 'string', example: 'lesson-789' },
                        status: { type: 'string', enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], example: 'IN_PROGRESS' },
                        watchDurationSeconds: { type: 'integer', example: 1200 },
                        startedAt: { type: 'string', format: 'date-time', nullable: true },
                        completedAt: { type: 'string', format: 'date-time', nullable: true },
                        isCompleted: { type: 'boolean', example: false },
                        isInProgress: { type: 'boolean', example: true },
                        isNotStarted: { type: 'boolean', example: false }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'user@example.com' },
                        password: { type: 'string', minLength: 6, example: 'password123' }
                    }
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['email', 'password', 'firstName', 'lastName', 'role'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'user@example.com' },
                        password: { type: 'string', minLength: 6, example: 'password123' },
                        firstName: { type: 'string', maxLength: 50, example: 'John' },
                        lastName: { type: 'string', maxLength: 50, example: 'Doe' },
                        phone: { type: 'string', example: '+1234567890' },
                        role: { type: 'string', enum: ['STUDENT', 'INSTRUCTOR'], example: 'STUDENT' }
                    }
                },
                UpdateProfileRequest: {
                    type: 'object',
                    properties: {
                        firstName: { type: 'string', maxLength: 50, example: 'John' },
                        lastName: { type: 'string', maxLength: 50, example: 'Doe' },
                        phone: { type: 'string', example: '+1234567890' },
                        profilePicture: { type: 'string', format: 'uri' }
                    }
                },
                ChangePasswordRequest: {
                    type: 'object',
                    required: ['currentPassword', 'newPassword'],
                    properties: {
                        currentPassword: { type: 'string', example: 'oldpassword123' },
                        newPassword: { type: 'string', minLength: 6, example: 'newpassword123' }
                    }
                },
                RefreshTokenRequest: {
                    type: 'object',
                    required: ['refreshToken'],
                    properties: {
                        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'object',
                            properties: {
                                user: { $ref: '#/components/schemas/User' },
                                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                            }
                        }
                    }
                },
                CreateCourseRequest: {
                    type: 'object',
                    required: ['categoryId', 'title', 'price', 'durationHours', 'level'],
                    properties: {
                        categoryId: { type: 'string', example: 'category-123' },
                        title: { type: 'string', maxLength: 200, example: 'React for Beginners' },
                        description: { type: 'string', example: 'Learn React from scratch' },
                        price: { type: 'number', minimum: 0, example: 99.99 },
                        thumbnail: { type: 'string', format: 'uri' },
                        durationHours: { type: 'integer', minimum: 1, example: 10 },
                        level: { type: 'string', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], example: 'BEGINNER' }
                    }
                },
                UpdateCourseRequest: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', maxLength: 200, example: 'React for Beginners' },
                        description: { type: 'string', example: 'Learn React from scratch' },
                        thumbnail: { type: 'string', format: 'uri' },
                        durationHours: { type: 'integer', minimum: 1, example: 10 }
                    }
                },
                CourseSearchQuery: {
                    type: 'object',
                    properties: {
                        search: { type: 'string', example: 'react' },
                        categoryId: { type: 'string', example: 'category-123' },
                        level: { type: 'string', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], example: 'BEGINNER' },
                        instructorId: { type: 'string', example: 'user-456' },
                        minPrice: { type: 'number', minimum: 0, example: 0 },
                        maxPrice: { type: 'number', minimum: 0, example: 100 },
                        limit: { type: 'integer', minimum: 1, maximum: 100, default: 20, example: 10 },
                        offset: { type: 'integer', minimum: 0, default: 0, example: 0 },
                        orderBy: { type: 'string', enum: ['createdAt', 'price', 'title'], example: 'createdAt' },
                        orderDirection: { type: 'string', enum: ['ASC', 'DESC'], example: 'DESC' }
                    }
                },
                PaginatedCourses: {
                    type: 'object',
                    properties: {
                        items: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Course' }
                        },
                        total: { type: 'integer', example: 100 },
                        limit: { type: 'integer', example: 20 },
                        offset: { type: 'integer', example: 0 }
                    }
                },
                EnrollCourseRequest: {
                    type: 'object',
                    required: ['courseId'],
                    properties: {
                        courseId: { type: 'string', example: 'course-123' }
                    }
                },
                UpdateLessonProgressRequest: {
                    type: 'object',
                    required: ['enrollmentId', 'lessonId', 'watchDurationSeconds'],
                    properties: {
                        enrollmentId: { type: 'string', example: 'enrollment-123' },
                        lessonId: { type: 'string', example: 'lesson-456' },
                        watchDurationSeconds: { type: 'integer', minimum: 0, example: 1200 }
                    }
                },
                EnrollmentProgress: {
                    type: 'object',
                    properties: {
                        enrollment: { $ref: '#/components/schemas/Enrollment' },
                        lessonProgresses: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/LessonProgress' }
                        },
                        completedLessons: { type: 'integer', example: 5 },
                        totalLessons: { type: 'integer', example: 10 },
                        progressPercentage: { type: 'integer', example: 50 },
                        certificate: { type: 'string', nullable: true, example: 'cert-123' }
                    }
                },
                CreateLessonRequest: {
                    type: 'object',
                    required: ['courseId', 'orderNumber'],
                    properties: {
                        courseId: { type: 'string', example: 'course-123' },
                        title: { type: 'string', example: 'Lesson Title', description: 'Optional if videoUrl provided' },
                        description: { type: 'string', description: 'Optional if videoUrl provided' },
                        videoUrl: { type: 'string', format: 'uri', example: 'https://www.youtube.com/watch?v=xxx', description: 'Auto-fills title, description, duration' },
                        content: { type: 'string' },
                        orderNumber: { type: 'integer', minimum: 1, example: 1 },
                        durationMinutes: { type: 'integer', minimum: 1, description: 'Optional if videoUrl provided' },
                        isPreview: { type: 'boolean', default: false }
                    }
                },
                UpdateLessonRequest: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        videoUrl: { type: 'string', format: 'uri' },
                        content: { type: 'string' },
                        orderNumber: { type: 'integer', minimum: 1 },
                        durationMinutes: { type: 'integer', minimum: 1 },
                        isPreview: { type: 'boolean' },
                        refreshYouTubeData: { type: 'boolean', default: false, description: 'Force refresh from YouTube API' }
                    }
                },
                BulkCreateFromPlaylistRequest: {
                    type: 'object',
                    required: ['playlistUrl'],
                    properties: {
                        playlistUrl: { type: 'string', format: 'uri', example: 'https://www.youtube.com/playlist?list=PLxxx' },
                        startOrderNumber: { type: 'integer', minimum: 1, default: 1 }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Error message' }
                    }
                }
            }
        },
        paths: {
            ...youtubePaths,
            ...authPaths,
            ...userPaths,
            ...coursePaths,
            ...enrollmentPaths
        },
        tags: [
            { name: 'Authentication', description: 'User authentication and session management' },
            { name: 'Users', description: 'User profile management' },
            { name: 'Courses', description: 'Course management and operations' },
            { name: 'Enrollments', description: 'Course enrollment and progress tracking' },
            { name: 'YouTube', description: 'YouTube video and playlist operations' },
            { name: 'Lessons', description: 'Lesson management with YouTube integration' }
        ],
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/presentation/controller/*.ts", "./src/presentation/routes/*.ts"],
}

export const swaggerSpec = swaggerJSDoc(swaggerOptions)