export class Lesson {
    private constructor(
        private readonly _id: string,
        private readonly _courseId: string,
        private _title: string,
        private _description: string | null,
        private _videoUrl: string | null,
        private _content: string | null,
        private _orderNumber: number,
        private _durationMinutes: number,
        private _isPreview: boolean,
        private readonly _createdAt: Date,
        private _updatedAt: Date
    ) {}

    public static create(data: {
        courseId: string;
        title: string;
        description?: string;
        videoUrl?: string;
        content?: string;
        orderNumber: number;
        durationMinutes: number;
        isPreview?: boolean;
    }): Lesson {
        const id = crypto.randomUUID();
        const now = new Date();

        if (!data.title.trim()) {
            throw new Error('Lesson title is required');
        }

        if (data.orderNumber <= 0) {
            throw new Error('Order number must be positive');
        }

        if (data.durationMinutes <= 0) {
            throw new Error('Duration must be positive');
        }

        return new Lesson(
            id,
            data.courseId,
            data.title.trim(),
            data.description?.trim() || null,
            data.videoUrl || null,
            data.content || null,
            data.orderNumber,
            data.durationMinutes,
            data.isPreview || false,
            now,
            now
        );
    }

    public static reconstitute(data: {
        id: string;
        courseId: string;
        title: string;
        description: string | null;
        videoUrl: string | null;
        content: string | null;
        orderNumber: number;
        durationMinutes: number;
        isPreview: boolean;
        createdAt: Date;
        updatedAt: Date;
    }): Lesson {
        return new Lesson(
            data.id,
            data.courseId,
            data.title,
            data.description,
            data.videoUrl,
            data.content,
            data.orderNumber,
            data.durationMinutes,
            data.isPreview,
            data.createdAt,
            data.updatedAt
        );
    }

    // Getters
    public get id(): string { return this._id; }
    public get courseId(): string { return this._courseId; }
    public get title(): string { return this._title; }
    public get description(): string | null { return this._description; }
    public get videoUrl(): string | null { return this._videoUrl; }
    public get content(): string | null { return this._content; }
    public get orderNumber(): number { return this._orderNumber; }
    public get durationMinutes(): number { return this._durationMinutes; }
    public get isPreview(): boolean { return this._isPreview; }
    public get createdAt(): Date { return this._createdAt; }
    public get updatedAt(): Date { return this._updatedAt; }

    // Business methods
    public update(data: {
        title?: string;
        description?: string;
        videoUrl?: string;
        content?: string;
        durationMinutes?: number;
        isPreview?: boolean;
    }): void {
        if (data.title && data.title.trim()) {
            this._title = data.title.trim();
        }
        if (data.description !== undefined) {
            this._description = data.description?.trim() || null;
        }
        if (data.videoUrl !== undefined) {
            this._videoUrl = data.videoUrl;
        }
        if (data.content !== undefined) {
            this._content = data.content;
        }
        if (data.durationMinutes && data.durationMinutes > 0) {
            this._durationMinutes = data.durationMinutes;
        }
        if (data.isPreview !== undefined) {
            this._isPreview = data.isPreview;
        }
        this._updatedAt = new Date();
    }

    public reorder(newOrderNumber: number): void {
        if (newOrderNumber <= 0) {
            throw new Error('Order number must be positive');
        }
        this._orderNumber = newOrderNumber;
        this._updatedAt = new Date();
    }

    public makePreview(): void {
        this._isPreview = true;
        this._updatedAt = new Date();
    }

    public removePreview(): void {
        this._isPreview = false;
        this._updatedAt = new Date();
    }
}