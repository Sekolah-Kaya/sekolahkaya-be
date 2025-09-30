import { Review } from "./Review";
import { CreateReviewDTO, ReviewFilter, UpdateReviewDTO } from "./ReviewDTO";

export interface IReviewRepository {
    create(data: CreateReviewDTO): Promise<boolean>
    delete(id: string): Promise<boolean>
    update(id: string, data: UpdateReviewDTO): Promise<boolean>
    findAll(courseId: string, filter: ReviewFilter): Promise<Review[]>
}