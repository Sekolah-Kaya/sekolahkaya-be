import { PrismaClient } from "@prisma/client";
import { ICourseRepository } from "../../../domain/course/ICourseRepository";
import { Course } from "../../../domain/course/Course";
import { CourseQuery } from "../../../domain/course/CourseDTO";
import { Lesson } from "../../../domain/lesson/Lesson";

export class CourseRepository implements ICourseRepository {
    public constructor(readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<Course | null> {
        const courseData = await this.prisma.course.findUnique({
            where: { id }
        })

        return courseData ? this.toDomain(courseData) : null
    }

    async findAll(): Promise<Course[]> {
        const courses = await this.prisma.course.findMany({
            where: { status: 'PUBLISHED' },
            orderBy: { createdAt: 'desc' }
        })

        return courses.map(course => this.toDomain(course))
    }

    async findByInstructorId(instructorId: string): Promise<Course[]> {
        const courses = await this.prisma.course.findMany({
            where: { instructorId },
            orderBy: { createdAt: 'desc' },
        })

        return courses.map(course => this.toDomain(course))
    }

    async searchCourses(query: CourseQuery): Promise<{ items: Course[]; total: number; }> {
        const where: any = {}

        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } }
            ]
        }

        if (query.categoryId) {
            where.categoryId = query.categoryId;
        }

        if (query.level) {
            where.level = query.level;
        }

        if (query.instructorId) {
            where.instructorId = query.instructorId;
        }

        if (query.status) {
            where.status = query.status;
        } else {
            where.status = 'PUBLISHED'; // Default to published only
        }

        if (query.priceRange) {
            where.price = {
                gte: query.priceRange[0],
                lte: query.priceRange[1]
            }
        }

        const orderBy: any = {}
        if (query.orderBy === 'title') { orderBy.title = query.orderDirection || 'asc' }
        else if (query.orderBy === 'price') { orderBy.price = query.orderDirection || 'asc' }
        else { orderBy.createdAt = query.orderDirection || 'desc' }

        const [courses, total] = await Promise.all([
            this.prisma.course.findMany({
                where,
                orderBy,
                skip: query.offset || 0,
                take: query.limit || 20
            }),
            this.prisma.course.count({ where })
        ])

        return {
            items: courses.map(course => this.toDomain(course)),
            total
        }
    }

    async getCourseLessons(courseId: string): Promise<Lesson[]> {
        const lessons = await this.prisma.lesson.findMany({
            where: { courseId }
        })

        return lessons.map(lesson => this.lessonToDomain(lesson))
    }

    async create(data: Course): Promise<Course> {
        const courseData = await this.prisma.course.create({
            data: {
                id: data.id,
                instructorId: data.instructorId,
                categoryId: data.categoryId,
                title: data.title,
                description: data.description,
                price: data.price.getValue(),
                thumbnail: data.thumbnail,
                status: data.status,
                durationHours: data.durationHours,
                level: data.level
            }
        })

        return this.toDomain(courseData)
    }

    async update(id: string, data: Partial<Course>): Promise<Course | null> {
        const courseData = await this.prisma.course.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                thumbnail: data.thumbnail,
                status: data.status,
                durationHours: data.durationHours
            }
        })

        return this.toDomain(courseData)
    }

    async delete(id: string): Promise<boolean> {
        try {
            await this.prisma.course.delete({
                where: { id }
            })

            return true
        } catch (error) {
            return false
        }
    }

    private toDomain(courseData: any): Course {
        return Course.reconstitute({
            id: courseData.id,
            instructorId: courseData.instructorId,
            categoryId: courseData.categoryId,
            title: courseData.title,
            description: courseData.description,
            price: courseData.price,
            thumbnail: courseData.thumbnail,
            status: courseData.status,
            durationHours: courseData.durationHours,
            level: courseData.level,
            createdAt: courseData.createdAt,
            updatedAt: courseData.updatedAt
        });
    }

    private lessonToDomain(lessonData: any): Lesson {
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
        });
    }
}