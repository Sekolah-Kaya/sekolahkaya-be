import { Enrollment } from "../../../domain/enrollment/Enrollment";
import { IEnrollmentRepository } from "../../../domain/enrollment/IEnrollmentRepository";
import { PrismaClient, Enrollment as PrismaEnrollment } from "@prisma/client";

export class EnrollmentRepository implements IEnrollmentRepository {
    public constructor(readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<Enrollment | null> {
        const enrollmentData = await this.prisma.enrollment.findUnique({
            where: { id }
        })

        return enrollmentData ? this.toDomain(enrollmentData) : null
    }

    async findByUserId(userId: string): Promise<Enrollment[]> {
        const enrollments = await this.prisma.enrollment.findMany({
            where: { userId },
            orderBy: { enrolledAt: 'desc' }
        })

        return enrollments.map(enrollment => this.toDomain(enrollment))
    }

    async findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null> {
        const enrollmentData = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId
                }
            }
        })

        return enrollmentData ? this.toDomain(enrollmentData) : null
    }

    async findAll(): Promise<Enrollment[]> {
        const enrollments = await this.prisma.enrollment.findMany({
            orderBy: { enrolledAt: 'desc' }
        });

        return enrollments.map(enrollment => this.toDomain(enrollment));
    }

    async create(data: Enrollment): Promise<Enrollment> {
        const enrollmentData = await this.prisma.enrollment.create({
            data: {
                id: data.id,
                userId: data.userId,
                courseId: data.courseId,
                amountPaid: data.amountPaid.getValue(),
                status: data.status,
                progressPercentage: data.progressPercentage
            }
        })

        return this.toDomain(enrollmentData)
    }

    async update(id: string, data: Enrollment): Promise<Enrollment | null> {
        const enrollmentData = await this.prisma.enrollment.update({
            where: { id },
            data: {
                status: data.status,
                progressPercentage: data.progressPercentage,
                completedAt: data.completedAt
            }
        })

        return this.toDomain(enrollmentData)
    }

    async delete(id: string): Promise<boolean> {
        try {
            await this.prisma.enrollment.delete({
                where: { id }
            })

            return true
        } catch (error) {
            return false
        }
    }

    private toDomain(enrollmentData: any): Enrollment {
        return Enrollment.reconstitute({
            id: enrollmentData.id,
            userId: enrollmentData.userId,
            courseId: enrollmentData.courseId,
            amountPaid: enrollmentData.amountPaid,
            status: enrollmentData.status,
            enrolledAt: enrollmentData.enrolledAt,
            completedAt: enrollmentData.completedAt,
            progressPercentage: enrollmentData.progressPercentage
        });
    }
}