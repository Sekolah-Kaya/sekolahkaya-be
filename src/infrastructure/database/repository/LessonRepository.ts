import { PrismaClient } from "@prisma/client";
import { ILessonRepository } from "../../../domain/lesson/ILessonRepository";
import { Lesson } from "../../../domain/lesson/Lesson";

export class LessonRepository implements ILessonRepository {
    public constructor(readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<Lesson | null> {
        const data = await this.prisma.lesson.findUnique({
            where: { id }
        })

        return data ? this.toDomain(data) : null
    }

    async findByCourseId(courseId: string): Promise<Lesson[]> {
        const lessons = await this.prisma.lesson.findMany({
            where: { courseId },
            orderBy: { orderNumber: 'asc' }
        })

        return lessons.map(lesson => this.toDomain(lesson))
    }

    async findAll(): Promise<Lesson[]> {
        const lessons = await this.prisma.lesson.findMany({
            orderBy: { createdAt: 'desc' }
        })

        return lessons.map(lesson => this.toDomain(lesson))
    }

    async create(data: Lesson): Promise<Lesson> {
        const lessonData = await this.prisma.lesson.create({
            data: {
                id: data.id,
                courseId: data.courseId,
                title: data.title,
                description: data.description,
                videoUrl: data.videoUrl,
                content: data.content,
                orderNumber: data.orderNumber,
                durationMinutes: data.durationMinutes,
                isPreview: data.isPreview,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
            }
        })

        return this.toDomain(lessonData)
    }

    async update(id: string, data: Partial<Lesson>): Promise<Lesson | null> {
        try {
            const lessonData = await this.prisma.lesson.update({
                where: { id },
                data: {
                    title: data.title,
                    description: data.description,
                    videoUrl: data.videoUrl,
                    content: data.content,
                    orderNumber: data.orderNumber,
                    durationMinutes: data.durationMinutes,
                    isPreview: data.isPreview,
                    updatedAt: new Date()
                }
            })

            return this.toDomain(lessonData)
        } catch {
            return null
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            await this.prisma.lesson.delete({
                where: { id }
            })
            return true
        } catch {
            return false
        }
    }

    private toDomain(lessonData: any): Lesson {
        return Lesson.reconstitute({
            id: lessonData.id,
            courseId: lessonData.courseId,
            title: lessonData.title,
            description: lessonData.description,
            videoUrl: lessonData.videoUrl,
            content: lessonData.content,
            orderNumber: lessonData.orderNumber,
            durationMinutes: lessonData.durationMinutes,
            isPreview: lessonData.isPreview,
            createdAt: lessonData.createdAt,
            updatedAt: lessonData.updatedAt
        })
    }
}
