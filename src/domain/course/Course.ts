import { CoursePublished, DomainEvent } from "../common/DomainEvent";
import { CourseLevel, CourseStatus } from "../common/enum";
import { Money } from "../common/ValueObject";

export class Course {
    private _domainEvents: DomainEvent[] = [];

    private constructor(
        private readonly _id: string,
        private readonly _instructorId: string,
        private readonly _categoryId: string,
        private _title: string,
        private _description: string | null,
        private readonly _price: Money,
        private _thumbnail: string | null,
        private _status: CourseStatus,
        private _durationHours: number,
        private readonly _level: CourseLevel,
        private readonly _createdAt: Date,
        private _updatedAt: Date
    ) {}

    public static create(data: {
        instructorId: string;
        categoryId: string;
        title: string;
        description?: string;
        price: number;
        thumbnail?: string;
        durationHours: number;
        level: CourseLevel;
    }): Course {
        const id = crypto.randomUUID();
        const now = new Date();

        if (!data.title.trim()) {
            throw new Error('Course title is required');
        }

        if (data.durationHours <= 0) {
            throw new Error('Course duration must be positive');
        }

        return new Course(
            id,
            data.instructorId,
            data.categoryId,
            data.title.trim(),
            data.description?.trim() || null,
            Money.create(data.price),
            data.thumbnail || null,
            CourseStatus.DRAFT,
            data.durationHours,
            data.level,
            now,
            now
        );
    }

    public static reconstitute(data: {
        id: string;
        instructorId: string;
        categoryId: string;
        title: string;
        description: string | null;
        price: number;
        thumbnail: string | null;
        status: CourseStatus;
        durationHours: number;
        level: CourseLevel;
        createdAt: Date;
        updatedAt: Date;
    }): Course {
        return new Course(
            data.id,
            data.instructorId,
            data.categoryId,
            data.title,
            data.description,
            Money.create(data.price),
            data.thumbnail,
            data.status,
            data.durationHours,
            data.level,
            data.createdAt,
            data.updatedAt
        );
    }

    // Getters
    public get id(): string { return this._id; }
    public get instructorId(): string { return this._instructorId; }
    public get categoryId(): string { return this._categoryId; }
    public get title(): string { return this._title; }
    public get description(): string | null { return this._description; }
    public get price(): Money { return this._price; }
    public get thumbnail(): string | null { return this._thumbnail; }
    public get status(): CourseStatus { return this._status; }
    public get durationHours(): number { return this._durationHours; }
    public get level(): CourseLevel { return this._level; }
    public get createdAt(): Date { return this._createdAt; }
    public get updatedAt(): Date { return this._updatedAt; }

    // Business methods
    public publish(): void {
        if (this._status !== CourseStatus.DRAFT) {
            throw new Error('Only draft courses can be published');
        }
        this._status = CourseStatus.PUBLISHED;
        this._updatedAt = new Date();
        
        this.addDomainEvent(new CoursePublished(this._id, this._title, this._instructorId));
    }

    public archive(): void {
        if (this._status === CourseStatus.ARCHIVED) {
            throw new Error('Course is already archived');
        }
        this._status = CourseStatus.ARCHIVED;
        this._updatedAt = new Date();
    }

    public unarchive(): void {
        if (this._status !== CourseStatus.ARCHIVED) {
            throw new Error('Only archived courses can be unarchived');
        }
        this._status = CourseStatus.DRAFT;
        this._updatedAt = new Date();
    }

    public isPublished(): boolean {
        return this._status === CourseStatus.PUBLISHED;
    }

    public isDraft(): boolean {
        return this._status === CourseStatus.DRAFT;
    }

    public isArchived(): boolean {
        return this._status === CourseStatus.ARCHIVED;
    }

    public isFree(): boolean {
        return this._price.isFree();
    }

    public canEnroll(): boolean {
        return this.isPublished();
    }

    public update(data: {
        title?: string;
        description?: string;
        thumbnail?: string;
        durationHours?: number;
    }): void {
        if (this.isPublished()) {
            throw new Error('Cannot update published course');
        }

        if (data.title && data.title.trim()) {
            this._title = data.title.trim();
        }
        if (data.description !== undefined) {
            this._description = data.description?.trim() || null;
        }
        if (data.thumbnail !== undefined) {
            this._thumbnail = data.thumbnail;
        }
        if (data.durationHours && data.durationHours > 0) {
            this._durationHours = data.durationHours;
        }
        this._updatedAt = new Date();
    }

    // Domain events
    public getDomainEvents(): DomainEvent[] {
        return [...this._domainEvents];
    }

    public clearDomainEvents(): void {
        this._domainEvents = [];
    }

    private addDomainEvent(event: DomainEvent): void {
        this._domainEvents.push(event);
    }
}