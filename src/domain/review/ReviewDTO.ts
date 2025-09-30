export interface CreateReviewCommand {
    userId: string;
    courseId: string;
    rating: number;
    comment?: string;
}

export interface UpdateReviewCommand {
    reviewId: string;
    userId: string;
    rating?: number;
    comment?: string;
}
