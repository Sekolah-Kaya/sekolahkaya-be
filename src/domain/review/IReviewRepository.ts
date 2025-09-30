import { IGenericRepository } from "../common/IGenericRepository";
import { Review } from "./Review";
import { CreateReviewCommand, UpdateReviewCommand } from "./ReviewDTO";

export interface IReviewRepository extends IGenericRepository<Review> {
    findAllWithFilter(courseId: string, filter?: any): Promise<Review[]>
}