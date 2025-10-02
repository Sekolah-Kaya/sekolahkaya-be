import { Request, Response } from 'express';
import { CourseLevel, Role } from "../../shared/types/Enum";
import { Course } from "../../domain/models/Course";
import { RequestValidator, ValidationRule } from "../middleware/ValidationRule";
import { BaseController } from "./BaseController";
import { CourseApplicationService } from '../../application/services/CourseApplicationService';
import { CreateCourseCommand } from '../../application/commands/course/CreateCourseCommand';
import { UpdateCourseCommand } from '../../application/commands/course/UpdateCourseCommand';
import { PublishCourseCommand } from '../../application/commands/course/PublishCourseCommand';
import { CourseQuery } from '../../application/queries/CourseQuery';

export class CourseController extends BaseController {
    public constructor(readonly courseService: CourseApplicationService) {
        super()
    }

    async createCourse(req: Request, res: Response): Promise<void> {
        try {
            if (this.getUserRole(req) !== Role.INSTRUCTOR) {
                this.sendForbidden(res, 'Only instructors can create courses')
                return
            }

            const validationRules: ValidationRule[] = [
                {
                    field: 'categoryId',
                    rules: [{ type: 'required' }]
                },
                {
                    field: 'title',
                    rules: [
                        { type: 'required' },
                        { type: 'maxLength', value: 200 }
                    ]
                },
                {
                    field: 'price',
                    rules: [
                        { type: 'required' },
                        { type: 'numeric' },
                        { type: 'positive' }
                    ]
                },
                {
                    field: 'durationHours',
                    rules: [
                        { type: 'required' },
                        { type: 'numeric' },
                        { type: 'positive' }
                    ]
                },
                {
                    field: 'level',
                    rules: [
                        { type: 'required' },
                        { type: 'enum', value: [CourseLevel.BEGINNER, CourseLevel.INTERMEDIATE, CourseLevel.ADVANCED] }
                    ]
                }
            ]

            const validationErrors = RequestValidator.validate(req.body, validationRules)
            if (Object.keys(validationErrors).length > 0) {
                this.sendValidationError(res, validationErrors)
                return
            }

            const command: CreateCourseCommand = {
                instructorId: this.getUserId(req),
                categoryId: req.body?.categoryId,
                title: req.body?.title,
                description: req.body?.description,
                price: parseFloat(req.body?.price),
                thumbnail: req.body?.thumbnail,
                durationHours: parseInt(req.body?.durationHours),
                level: req.body?.level
            };

            const result = await this.courseService.createCourse(command)
            if (result.success) {
                this.sendSuccess(res, this.formatCourseResponse(result.data!), 'Course created successfully', 201)
                return
            } else {
                this.sendError(res, result.error!)
            }
        } catch (error) {
            this.sendError(res, 'Course creation failed', 500)
        }
    }

    async updateCourse(req: Request, res: Response): Promise<void> {
        try {
            const courseId = req.params.id
            const instructorId = this.getUserId(req)

            const validationRules: ValidationRule[] = [
                {
                    field: 'title',
                    rules: [{ type: 'maxLength', value: 200 }]
                },
                {
                    field: 'durationHours',
                    rules: [
                        { type: 'numeric' },
                        { type: 'positive' }
                    ]
                }
            ];

            const validationErrors = RequestValidator.validate(req.body, validationRules)
            if (Object.keys(validationErrors).length > 0) {
                this.sendValidationError(res, validationErrors)
                return
            }

            const command: UpdateCourseCommand = {
                courseId,
                instructorId,
                title: req.body?.title,
                description: req.body?.description,
                thumbnail: req.body?.thumbnail,
                durationHours: req.body?.durationHours ? parseInt(req.body.durationHours) : undefined
            };

            const result = await this.courseService.updateCourse(command)
            if (result.success) {
                this.sendSuccess(res, this.formatCourseResponse(result.data!), 'Course updated successfully')
            } else {
                this.sendError(res, result.error!)
            }
        } catch (error) {
            this.sendError(res, 'Course update failed', 500)
        }
    }

    async publishCourse(req: Request, res: Response): Promise<void> {
        try {
            const courseId = req.params.id
            const instructorId = this.getUserId(req)

            const command: PublishCourseCommand = { 
                courseId,
                instructorId
            }

            const result = await this.courseService.publishCourse(command)
            if (result.success) {
                this.sendSuccess(res, this.formatCourseResponse(result.data!), 'Course published successfully')
            } else {
                this.sendError(res, result.error!)
            }
        } catch (error) {
            this.sendError(res, 'Course publishing failed', 500)
        }
    }

    async getCourse(req: Request, res: Response): Promise<void> {
        try {
            const courseId = req.params.id
            const result = await this.courseService.getCourseById(courseId)

            if (result.success) {
                this.sendSuccess(res, this.formatCourseResponse(result.data!))
            } else {
                this.sendError(res, result.error!)
            }
        } catch (error) {
            this.sendError(res, 'Failed to get course', 500)
        }
    }

    async searchCourses(req: Request, res: Response): Promise<void> {
        try {
            const query: CourseQuery = {
                search: req.query.search as string,
                categoryId: req.query.categoryId as string,
                level: req.query.level as CourseLevel,
                instructorId: req.query.instructorId as string,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
                offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
                orderBy: req.query.orderBy as any,
                orderDirection: req.query.orderDirection as any
            }

            if (req.query.minPrice && req.query.maxPrice) {
                query.priceRange = [
                    parseFloat(req.query.minPrice as string),
                    parseFloat(req.query.maxPrice as string)
                ]
            }

            const result = await this.courseService.searchCourses(query)
            if (result.success) {
                const formattedResult = {
                    ...result.data!,
                    items: result.data!.items.map(item => this.formatCourseResponse(item))
                }
                this.sendSuccess(res, formattedResult)
            } else {
                this.sendError(res, result.error!)
            }
        } catch (error) {
            this.sendError(res, 'Course search failed', 500)
        }
    }

    async getInstructorCourses(req: Request, res: Response): Promise<void> {
        try {
            const instructorId = this.getUserId(req)
            const result = await this.courseService.getInstructorCourses(instructorId)

            if (result.success) {
                const courses = result.data!.map(course => this.formatCourseResponse(course))
                this.sendSuccess(res, courses)
            } else {
                this.sendError(res, result.error!)
            }
        } catch (error) {
            this.sendError(res, 'Failed to get instructor courses', 500)
        }
    }

    async archiveCourse(req: Request, res: Response): Promise<void> {
        try {
            const courseId = req.params.id
            const instructorId = this.getUserId(req)

            const result = await this.courseService.archiveCourse(courseId, instructorId)
            if (result.success) {
                this.sendSuccess(res, this.formatCourseResponse(result.data!), 'Course archived successfully')
            } else {
                this.sendError(res, result.error!)
            }
        } catch (error) {
            this.sendError(res, 'Course archiving failed', 500)
        }
    }

    private formatCourseResponse(course: Course): any {
        return {
            id: course.id,
            instructorId: course.instructorId,
            categoryId: course.categoryId,
            title: course.title,
            description: course.description,
            price: course.price.getValue(),
            thumbnail: course.thumbnail,
            status: course.status,
            durationHours: course.durationHours,
            level: course.level,
            isFree: course.isFree(),
            canEnroll: course.canEnroll(),
            createdAt: course.createdAt,
            updatedAt: course.updatedAt
        };
    }
}