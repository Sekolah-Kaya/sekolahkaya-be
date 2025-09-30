import { Review } from "./Review";
import { CreateReviewCommand, UpdateReviewCommand } from "./ReviewDTO";

export interface IReviewRepository {
    create(data: CreateReviewCommand): Promise<boolean>
    delete(id: string): Promise<boolean>
    update(id: string, data: UpdateReviewCommand): Promise<boolean>
    findAll(courseId: string, filter: any): Promise<Review[]>
}