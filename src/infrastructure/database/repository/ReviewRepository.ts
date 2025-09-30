import { PrismaClient } from "@prisma/client";
import { IReviewRepository } from "../../../domain/review/IReviewRepository";
import { Review } from "../../../domain/review/Review";

export class ReviewRepository implements IReviewRepository {
    public constructor(readonly prisma: PrismaClient) { }

    async create(data: Review): Promise<Review> {
            const reviewData = await this.prisma.review.create({
                data: {
                    id: data.id,
                    userId: data.userId,
                    courseId: data.courseId,
                    rating: data.rating,
                    comment: data.comment,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                }
            });

            return this.toDomain(reviewData);
    }

    async update(id: string, data: Review): Promise<Review | null> {        
            const review = await this.findById(id);
            if (!review || !review.canEdit(data.userId)) {
                return null;
            }

            const reviewData = await this.prisma.review.update({
                where: { id },
                data: {
                    rating: data.rating,
                    comment: data.comment,
                    updatedAt: new Date()
                }
            });

            return this.toDomain(reviewData);
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

    async findAllWithFilter(courseId: string, filter?: any): Promise<Review[]> {
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

    async findById(id: string): Promise<Review | null> {
        const data = await this.prisma.review.findUnique({
            where: { id }
        });

        return data ? this.toDomain(data) : null;
    }

    async findAll(): Promise<Review[]> {
        const reviews = await this.prisma.review.findMany()

        return reviews.map(review => this.toDomain(review))
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
