export class Review {
    private constructor(
        private readonly _id: string,
        private readonly _userId: string,
        private readonly _courseId: string,
        private _rating: number,
        private _comment: string | null,
        private readonly _createdAt: Date,
        private _updatedAt: Date
    ) {}

    public static create(data: {
        userId: string;
        courseId: string;
        rating: number;
        comment?: string;
    }): Review {
        const id = crypto.randomUUID();
        const now = new Date();

        if (!this.isValidRating(data.rating)) {
            throw new Error('Rating must be between 1 and 5');
        }

        return new Review(
            id,
            data.userId,
            data.courseId,
            data.rating,
            data.comment?.trim() || null,
            now,
            now
        );
    }

    public static reconstitute(data: {
        id: string;
        userId: string;
        courseId: string;
        rating: number;
        comment: string | null;
        createdAt: Date;
        updatedAt: Date;
    }): Review {
        return new Review(
            data.id,
            data.userId,
            data.courseId,
            data.rating,
            data.comment,
            data.createdAt,
            data.updatedAt
        );
    }

    private static isValidRating(rating: number): boolean {
        return Number.isInteger(rating) && rating >= 1 && rating <= 5;
    }

    // Getters
    public get id(): string { return this._id; }
    public get userId(): string { return this._userId; }
    public get courseId(): string { return this._courseId; }
    public get rating(): number { return this._rating; }
    public get comment(): string | null { return this._comment; }
    public get createdAt(): Date { return this._createdAt; }
    public get updatedAt(): Date { return this._updatedAt; }

    // Business methods
    public update(data: { rating?: number; comment?: string }): void {
        if (data.rating && Review.isValidRating(data.rating)) {
            this._rating = data.rating;
        }
        
        if (data.comment !== undefined) {
            this._comment = data.comment?.trim() || null;
        }
        
        this._updatedAt = new Date();
    }

    public canEdit(userId: string): boolean {
        return this._userId === userId;
    }
}