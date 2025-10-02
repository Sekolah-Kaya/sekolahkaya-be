export interface CreateReviewCommand {
    userId: string;
    courseId: string;
    rating: number;
    comment?: string;
}
