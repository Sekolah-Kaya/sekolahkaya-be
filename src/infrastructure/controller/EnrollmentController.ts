import { EnrollmentApplicationService } from "../../application/EnrollmentApplicationService";
import { Enrollment } from "../../domain/enrollment/Enrollment";
import { EnrollCourseCommand } from "../../domain/enrollment/EnrollmentDTO";
import { LessonProgress } from "../../domain/lesson_progress/LessonProgress";
import { UpdateLessonProgressCommand } from "../../domain/lesson_progress/LessonProgressDTO";
import { RequestValidator, ValidationRule } from "../../middleware/ValidationRule";
import { BaseController } from "./BaseController";

export class EnrollmentController extends BaseController {
    public constructor(readonly enrollmentService: EnrollmentApplicationService) {
        super()
    }

    async enrollCourse(req: Request, res: Response): Promise<void> {
        try {
            const validationRules: ValidationRule[] = [
                {
                    field: 'courseId',
                    rules: [{ type: 'required' }]
                }
            ]

            const validationErrors = RequestValidator.validate(req.body, validationRules)
            if (Object.keys(validationErrors).length > 0) {
                this.sendValidationError(res, validationErrors)
                return
            }

            const command: EnrollCourseCommand = {
                userId: this.getUserId(req),
                courseId: req.body?.courseId
            }

            const result = await this.enrollmentService.enrollCourse(command)
            if (result.success) {
                this.sendSuccess(res, this.formatEnrollmentResponse(result.data!), 'Enrollment successfull', 201)
            } else {
                this.sendError(res, result.error!)
            }
        } catch (error) {
            this.sendError(res, 'Enrollment failed', 500)
        }
    }

    async getMyEnrollments(req: Request, res: Response): Promise<void> {
        try {
            const userId = this.getUserId(req)
            const result = await this.enrollmentService.getUserEnrollments(userId)

            if (result.success) {
                const enrollments = result.data!.map(enrollment => this.formatEnrollmentResponse(enrollment))
                this.sendSuccess(res, enrollments)
            } else {
                this.sendError(res, result.error!)
            }
        } catch (error) {
            this.sendError(res, 'Failed to get enrollments', 500)
        }
    }

    async getEnrollmentProgress(req: Request, res: Response): Promise<void> {
        try {
            const userId = this.getUserId(req)
            const enrollmentId = req.params.enrollmentId

            const result = await this.enrollmentService.getEnrollmentProgress(enrollmentId, userId)
            if (result.success) {
                const progress = result.data!
                this.sendSuccess(res, {
                    enrollment: this.formatEnrollmentResponse(progress.enrollment),
                    lessonProgresses: progress.lessonProgresses.map(lp => this.formatLessonProgressResponse(lp)),
                    completedLessons: progress.completedLessons,
                    totalLessons: progress.totalLessons,
                    progressPercentage: progress.progressPercentage,
                    certificate: progress.certificate
                })
            } else {
                this.sendError(res, result.error!)
            }
        } catch (error) {
            this.sendError(res, 'Failed to get enrollment progress', 500)
        }
    }

    async updateLessonProgress(req: Request, res: Response): Promise<void> {
        try {
            const validationRules: ValidationRule[] = [
                {
                    field: 'enrollmentId',
                    rules: [{ type: 'required' }]
                },
                {
                    field: 'lessonId',
                    rules: [{ type: 'required' }]
                },
                {
                    field: 'watchDurationSeconds',
                    rules: [
                        { type: 'required' },
                        { type: 'numeric' },
                        { type: 'positive' }
                    ]
                }
            ];

            const validationErrors = RequestValidator.validate(req.body, validationRules);
            if (Object.keys(validationErrors).length > 0) {
                this.sendValidationError(res, validationErrors);
                return;
            }

            const command: UpdateLessonProgressCommand = {
                userId: this.getUserId(req),
                enrollmentId: req.body?.enrollmentId,
                lessonId: req.body?.lessonId,
                watchDurationSeconds: parseInt(req.body?.watchDurationSeconds)
            };

            const result = await this.enrollmentService.updateLessonProgress(command);

            if (result.success) {
                this.sendSuccess(res, this.formatLessonProgressResponse(result.data!), 'Progress updated successfully');
            } else {
                this.sendError(res, result.error!);
            }
        } catch (error) {
            this.sendError(res, 'Progress update failed', 500);
        }
    }

    async completeLesson(req: Request, res: Response): Promise<void> {
        try {
            const validationRules: ValidationRule[] = [
                {
                    field: 'enrollmentId',
                    rules: [{ type: 'required' }]
                },
                {
                    field: 'lessonId',
                    rules: [{ type: 'required' }]
                },
                {
                    field: 'watchDurationSeconds',
                    rules: [
                        { type: 'required' },
                        { type: 'numeric' },
                        { type: 'positive' }
                    ]
                }
            ];

            const validationErrors = RequestValidator.validate(req.body, validationRules);
            if (Object.keys(validationErrors).length > 0) {
                this.sendValidationError(res, validationErrors);
                return;
            }

            const command: UpdateLessonProgressCommand = {
                userId: this.getUserId(req),
                enrollmentId: req.body?.enrollmentId,
                lessonId: req.body?.lessonId,
                watchDurationSeconds: parseInt(req.body?.watchDurationSeconds)
            };

            const result = await this.enrollmentService.updateLessonProgress(command);

            if (result.success) {
                this.sendSuccess(res, this.formatLessonProgressResponse(result.data!), 'Progress updated successfully');
            } else {
                this.sendError(res, result.error!);
            }
        } catch (error) {
            this.sendError(res, 'Progress update failed', 500);
        }
    }

    async cancelEnrollment(req: Request, res: Response): Promise<void> {
        try {
            const enrollmentId = req.params.id;
            const userId = this.getUserId(req);

            const result = await this.enrollmentService.cancelEnrollment(enrollmentId, userId);

            if (result.success) {
                this.sendSuccess(res, null, 'Enrollment cancelled successfully');
            } else {
                this.sendError(res, result.error!);
            }
        } catch (error) {
            this.sendError(res, 'Enrollment cancellation failed', 500);
        }
    }

    private formatEnrollmentResponse(enrollment: Enrollment): any {
        return {
            id: enrollment.id,
            userId: enrollment.userId,
            courseId: enrollment.courseId,
            amountPaid: enrollment.amountPaid.getValue(),
            status: enrollment.status,
            enrolledAt: enrollment.enrolledAt,
            completedAt: enrollment.completedAt,
            progressPercentage: enrollment.progressPercentage,
            isActive: enrollment.isActive(),
            isCompleted: enrollment.isCompleted(),
            isCancelled: enrollment.isCancelled()
        };
    }

    private formatLessonProgressResponse(progress: LessonProgress): any {
        return {
            id: progress.id,
            enrollmentId: progress.enrollmentId,
            lessonId: progress.lessonId,
            status: progress.status,
            watchDurationSeconds: progress.watchDurationSeconds,
            startedAt: progress.startedAt,
            completedAt: progress.completedAt,
            isCompleted: progress.isCompleted(),
            isInProgress: progress.isInProgress(),
            isNotStarted: progress.isNotStarted()
        };
    }
}