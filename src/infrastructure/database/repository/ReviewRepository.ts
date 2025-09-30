import { PrismaClient } from "@prisma/client";
import { IReviewRepository } from "../../../domain/review/IReviewRepository";
import { Review } from "../../../domain/review/Review";
import { CreateReviewCommand, UpdateReviewCommand } from "../../../domain/review/ReviewDTO";

export class ReviewRepository implements IReviewRepository {
    public constructor(readonly prisma: PrismaClient) { }

    async create(data: CreateReviewCommand): Promise<boolean> {
        try {
            const review = Review.create({
                userId: data.userId,
                courseId: data.courseId,
                rating: data.rating,
                comment: data.comment
            });

            await this.prisma.review.create({
                data: {
                    id: review.id,
                    userId: review.userId,
                    courseId: review.courseId,
                    rating: review.rating,
                    comment: review.comment,
                    createdAt: review.createdAt,
                    updatedAt: review.updatedAt
                }
            });

            return true;
        } catch {
            return false;
        }
    }

    async update(id: string, data: UpdateReviewCommand): Promise<boolean> {
        try {
            const review = await this.findById(id);
            if (!review || !review.canEdit(data.userId)) {
                return false;
            }

            review.update({
                rating: data.rating,
                comment: data.comment
            });

            await this.prisma.review.update({
                where: { id },
                data: {
                    rating: review.rating,
                    comment: review.comment,
                    updatedAt: new Date()
                }
            });

            return true;
        } catch {
            return false;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            await this.prisma.review.delete({
                where: { id }
            });
            return true;
        } catch {
            return false;
        }
    }

    async findAll(courseId: string, filter: any): Promise<Review[]> {
        const where: any = { courseId };

        if (filter?.rating) {
            where.rating = filter.rating;
        }

        const reviews = await this.prisma.review.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        return reviews.map(review => this.toDomain(review));
    }

    private async findById(id: string): Promise<Review | null> {
        const data = await this.prisma.review.findUnique({
            where: { id }
        });

        return data ? this.toDomain(data) : null;
    }

    private toDomain(reviewData: any): Review {
        return Review.reconstitute({
            id: reviewData.id,
            userId: reviewData.userId,
            courseId: reviewData.courseId,
            rating: reviewData.rating,
            comment: reviewData.comment,
            createdAt: reviewData.createdAt,
            updatedAt: reviewData.updatedAt
        });
    }
}
