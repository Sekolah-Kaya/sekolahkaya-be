export interface UpdateReviewCommand {
    reviewId: string;
    userId: string;
    rating?: number;
    comment?: string;
}
