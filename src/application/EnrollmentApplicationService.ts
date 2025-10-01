import { ApplicationResult } from "../domain/common/ResultObject";
import { ICourseRepository } from "../domain/course/ICourseRepository";
import { Enrollment } from "../domain/enrollment/Enrollment";
import { EnrollmentDomainService } from "../domain/enrollment/EnrollmentDomainService";
import { EnrollCourseCommand, EnrollmentProgressDTO } from "../domain/enrollment/EnrollmentDTO";
import { IEnrollmentApplicationService } from "../domain/enrollment/IEnrollmentApplicationService";
import { IEnrollmentRepository } from "../domain/enrollment/IEnrollmentRepository";
import { ILessonRepository } from "../domain/lesson/ILessonRepository";
import { ILessonProgressRepository } from "../domain/lesson_progress/ILessonProgressRepository";
import { LessonProgress } from "../domain/lesson_progress/LessonProgress";
import { CompleteLessonCommand, UpdateLessonProgressCommand } from "../domain/lesson_progress/LessonProgressDTO";
import { ProgressCalculationService } from "../domain/lesson_progress/ProgressCalculationService";
import { IUserRepository } from "../domain/user/IUserRepository";
import { IEmailService } from "./EmailService";
import { IEventDispatcher } from "./EventDispatcher";
import { IPaymentService } from "./PaymentService";

export class EnrollmentApplicationService implements IEnrollmentApplicationService {
    public constructor(
        private readonly enrollmentRepository: IEnrollmentRepository,
        private readonly courseRepository: ICourseRepository,
        private readonly userRepository: IUserRepository,
        private readonly lessonRepository: ILessonRepository,
        private readonly lessonProgressRepository: ILessonProgressRepository,
        private readonly paymentService: IPaymentService,
        private readonly eventDispatcher: IEventDispatcher,
        private readonly emailService: IEmailService,
    ) { }

    async enrollCourse(command: EnrollCourseCommand): Promise<ApplicationResult<Enrollment>> {
        try {
            const [user, course] = await Promise.all([
                this.userRepository.findById(command.userId),
                this.courseRepository.findById(command.courseId)
            ])

            if (!user) {
                return { success: false, error: 'User not found' };
            }
            if (!course) {
                return { success: false, error: 'Course not found' };
            }

            if (!EnrollmentDomainService.canUserEnrollCourse(user, course)) {
                return {
                    success: false,
                    error: 'User cannot enroll in this course'
                };
            }

            const existingEnrollment = await this.enrollmentRepository.findByUserAndCourse(command.userId, command.courseId)
            if (existingEnrollment) {
                return {
                    success: false,
                    error: 'User already enrolled in this course'
                }
            }

            const price = EnrollmentDomainService.calculateEnrollmentPrice(course, user)

            const enrollment = Enrollment.create({
                userId: command.userId,
                courseId: command.courseId,
                amountPaid: price.getValue()
            });

            const savedEnrollment = await this.enrollmentRepository.create(enrollment)

            const lessons = await this.lessonRepository.findByCourseId(course.id)
            for (const lesson of lessons) {
                const progress = LessonProgress.create({
                    enrollmentId: savedEnrollment.id,
                    lessonId: lesson.id,
                })

                await this.lessonProgressRepository.create(progress)
            }

            if (!price.isFree()) {
                await this.paymentService.createPayment({
                    enrollmentId: savedEnrollment.id,
                    amount: price.getValue()
                })
            }

            const events = enrollment.getDomainEvents();
            for (const event of events) {
                await this.eventDispatcher.dispatch(event);
            }
            enrollment.clearDomainEvents();

            // Send confirmation email
            await this.emailService.sendEnrollmentConfirmation(user, course);

            return {
                success: true,
                data: savedEnrollment
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Enrollment failed'
            };
        }
    }

    async updateLessonProgress(command: UpdateLessonProgressCommand): Promise<ApplicationResult<LessonProgress>> {
        try {
            // Verify enrollment ownership
            const enrollment = await this.enrollmentRepository.findById(command.enrollmentId);
            if (!enrollment || enrollment.userId !== command.userId) {
                return {
                    success: false,
                    error: 'Enrollment not found or access denied'
                };
            }

            // Get lesson progress
            const progress = await this.lessonProgressRepository.findByEnrollmentAndLesson(
                command.enrollmentId,
                command.lessonId
            );

            if (!progress) {
                return {
                    success: false,
                    error: 'Lesson progress not found'
                };
            }

            // Update watch time
            progress.updateWatchTime(command.watchDurationSeconds);

            // Save progress
            const updatedProgress = await this.lessonProgressRepository.update(progress.id, progress);

            // Recalculate course progress
            await this.recalculateEnrollmentProgress(command.enrollmentId);

            return {
                success: true,
                data: updatedProgress!
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Progress update failed'
            };
        }
    }

    async completeLesson(command: CompleteLessonCommand): Promise<ApplicationResult<LessonProgress>> {
        try {
            // Verify enrollment ownership
            const enrollment = await this.enrollmentRepository.findById(command.enrollmentId);
            if (!enrollment || enrollment.userId !== command.userId) {
                return {
                    success: false,
                    error: 'Enrollment not found or access denied'
                };
            }

            // Get lesson progress
            const progress = await this.lessonProgressRepository.findByEnrollmentAndLesson(
                command.enrollmentId,
                command.lessonId
            );

            if (!progress) {
                return {
                    success: false,
                    error: 'Lesson progress not found'
                };
            }

            // Mark as completed
            progress.markAsCompleted();

            // Save progress
            const completedProgress = await this.lessonProgressRepository.update(progress.id, progress);

            // Recalculate course progress
            await this.recalculateEnrollmentProgress(command.enrollmentId);

            return {
                success: true,
                data: completedProgress!
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Lesson completion failed'
            };
        }
    }
    private async recalculateEnrollmentProgress(enrollmentId: string): Promise<void> {
        const enrollment = await this.enrollmentRepository.findById(enrollmentId);
        if (!enrollment) return;

        const lessonProgresses = await this.lessonProgressRepository.findByEnrollmentId(enrollmentId);
        const totalLessons = lessonProgresses.length;

        const newProgress = ProgressCalculationService.calculateCourseProgress(
            lessonProgresses,
            totalLessons
        );

        enrollment.updateProgress(newProgress);

        if (ProgressCalculationService.shouldCompleteEnrollment(newProgress)) {
            enrollment.complete();
        }

        await this.enrollmentRepository.update(enrollment.id, enrollment);
    }

    async getUserEnrollments(userId: string): Promise<ApplicationResult<Enrollment[]>> {
        try {
            const enrollments = await this.enrollmentRepository.findByUserId(userId);
            return {
                success: true,
                data: enrollments
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get enrollments'
            };
        }
    }

    async getEnrollmentProgress(enrollmentId: string, userId: string): Promise<ApplicationResult<EnrollmentProgressDTO>> {
        try {
            const enrollment = await this.enrollmentRepository.findById(enrollmentId);
            if (!enrollment || enrollment.userId !== userId) {
                return {
                    success: false,
                    error: 'Enrollment not found or access denied'
                };
            }

            const lessonProgresses = await this.lessonProgressRepository.findByEnrollmentId(enrollmentId);
            const totalLessons = lessonProgresses.length;
            const completedLessons = lessonProgresses.filter(p => p.isCompleted()).length;

            const progressData: EnrollmentProgressDTO = {
                enrollment,
                lessonProgresses,
                completedLessons,
                totalLessons,
                progressPercentage: enrollment.progressPercentage
            };

            return {
                success: true,
                data: progressData
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get enrollment progress'
            };
        }
    }

    async cancelEnrollment(enrollmentId: string, userId: string): Promise<ApplicationResult<boolean>> {
        try {
            const enrollment = await this.enrollmentRepository.findById(enrollmentId);
            if (!enrollment || enrollment.userId !== userId) {
                return {
                    success: false,
                    error: 'Enrollment not found or access denied'
                };
            }

            enrollment.cancel();
            await this.enrollmentRepository.update(enrollment.id, enrollment);

            return {
                success: true,
                data: true
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Enrollment cancellation failed'
            };
        }
    }

}