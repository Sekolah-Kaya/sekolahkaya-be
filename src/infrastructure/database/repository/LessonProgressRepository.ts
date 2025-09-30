import { PrismaClient } from "@prisma/client";
import { ILessonProgressRepository } from "../../../domain/lesson_progress/ILessonProgressRepository";
import { LessonProgress } from "../../../domain/lesson_progress/LessonProgress";

export class LessonProgressRepository implements ILessonProgressRepository {
    public constructor(readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<LessonProgress | null> {
        const progressData = await this.prisma.lessonProgress.findUnique({
            where: { id }
        })

        return progressData ? this.toDomain(progressData) : null
    }

    async findByEnrollmentId(enrollmentId: string): Promise<LessonProgress[]> {
        const progresses = await this.prisma.lessonProgress.findMany({
            where: { enrollmentId }
        })

        return progresses.map(progress => this.toDomain(progress))
    }

    async findByEnrollmentAndLesson(enrollmentId: string, lessonId: string): Promise<LessonProgress | null> {
        const progressData = await this.prisma.lessonProgress.findUnique({
            where: {
                enrollmentId_lessonId: {
                    enrollmentId,
                    lessonId
                }
            }
        })

        return progressData ? this.toDomain(progressData) : null
    }

    async findAll(): Promise<LessonProgress[]> {
        const progresses = await this.prisma.lessonProgress.findMany()

        return progresses.map(progress => this.toDomain(progress))
    }

    async create(data: LessonProgress): Promise<LessonProgress> {
        const progressData = await this.prisma.lessonProgress.create({
            data: {
                id: data.id,
                enrollmentId: data.enrollmentId,
                lessonId: data.lessonId,
                status: data.status,
                watchDurationSeconds: data.watchDurationSeconds
            }
        })

        return this.toDomain(progressData)
    }

    async update(id: string, data: Partial<LessonProgress>): Promise<LessonProgress | null> {
        const progressData = await this.prisma.lessonProgress.update({
            where: { id },
            data: {
                status: data.status,
                watchDurationSeconds: data.watchDurationSeconds,
                startedAt: data.startedAt,
                completedAt: data.completedAt
            }
        })

        return this.toDomain(progressData)
    }

    async delete(id: string): Promise<boolean> {
        try {
            await this.prisma.lessonProgress.delete({
                where: { id }
            })

            return true
        } catch (error) {
            return false
        }
    }

    private toDomain(progressData: any): LessonProgress {
        return LessonProgress.reconstitute({
            id: progressData.id,
            enrollmentId: progressData.enrollmentId,
            lessonId: progressData.lessonId,
            status: progressData.status,
            watchDurationSeconds: progressData.watchDurationSeconds,
            startedAt: progressData.startedAt,
            completedAt: progressData.completedAt
        });
    }
}