import { DomainEvent, UserEnrolled } from "../common/DomainEvent";
import { EnrollmentStatus } from "../common/enum";
import { Money } from "../common/ValueObject";

export class Enrollment {
    private _domainEvents: DomainEvent[] = [];

    private constructor(
        private readonly _id: string,
        private readonly _userId: string,
        private readonly _courseId: string,
        private readonly _amountPaid: Money,
        private _status: EnrollmentStatus,
        private readonly _enrolledAt: Date,
        private _completedAt: Date | null,
        private _progressPercentage: number
    ) {}

    public static create(data: {
        userId: string;
        courseId: string;
        amountPaid: number;
    }): Enrollment {
        const id = crypto.randomUUID();
        const now = new Date();

        const enrollment = new Enrollment(
            id,
            data.userId,
            data.courseId,
            Money.create(data.amountPaid),
            EnrollmentStatus.ACTIVE,
            now,
            null,
            0
        );

        enrollment.addDomainEvent(new UserEnrolled(id, data.userId, data.courseId, data.amountPaid));
        return enrollment;
    }

    public static reconstitute(data: {
        id: string;
        userId: string;
        courseId: string;
        amountPaid: number;
        status: EnrollmentStatus;
        enrolledAt: Date;
        completedAt: Date | null;
        progressPercentage: number;
    }): Enrollment {
        return new Enrollment(
            data.id,
            data.userId,
            data.courseId,
            Money.create(data.amountPaid),
            data.status,
            data.enrolledAt,
            data.completedAt,
            data.progressPercentage
        );
    }

    // Getters
    public get id(): string { return this._id; }
    public get userId(): string { return this._userId; }
    public get courseId(): string { return this._courseId; }
    public get amountPaid(): Money { return this._amountPaid; }
    public get status(): EnrollmentStatus { return this._status; }
    public get enrolledAt(): Date { return this._enrolledAt; }
    public get completedAt(): Date | null { return this._completedAt; }
    public get progressPercentage(): number { return this._progressPercentage; }

    // Business methods
    public updateProgress(percentage: number): void {
        if (percentage < 0 || percentage > 100) {
            throw new Error('Progress percentage must be between 0 and 100');
        }
        
        this._progressPercentage = percentage;
        
        if (percentage === 100 && this._status === EnrollmentStatus.ACTIVE) {
            this.complete();
        }
    }

    public complete(): void {
        if (this._status !== EnrollmentStatus.ACTIVE) {
            throw new Error('Only active enrollments can be completed');
        }
        
        this._status = EnrollmentStatus.COMPLETED;
        this._completedAt = new Date();
        this._progressPercentage = 100;
    }

    public cancel(): void {
        if (this._status === EnrollmentStatus.CANCELLED) {
            throw new Error('Enrollment is already cancelled');
        }
        
        this._status = EnrollmentStatus.CANCELLED;
    }

    public isActive(): boolean {
        return this._status === EnrollmentStatus.ACTIVE;
    }

    public isCompleted(): boolean {
        return this._status === EnrollmentStatus.COMPLETED;
    }

    public isCancelled(): boolean {
        return this._status === EnrollmentStatus.CANCELLED;
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