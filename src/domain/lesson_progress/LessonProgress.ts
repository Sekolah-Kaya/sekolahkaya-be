import { ProgressStatus } from "../common/enum";

export class LessonProgress {
    private constructor(
        private readonly _id: string,
        private readonly _enrollmentId: string,
        private readonly _lessonId: string,
        private _status: ProgressStatus,
        private _watchDurationSeconds: number,
        private _startedAt: Date | null,
        private _completedAt: Date | null
    ) {}

    public static create(data: {
        enrollmentId: string;
        lessonId: string;
    }): LessonProgress {
        const id = crypto.randomUUID();

        return new LessonProgress(
            id,
            data.enrollmentId,
            data.lessonId,
            ProgressStatus.NOT_STARTED,
            0,
            null,
            null
        );
    }

    public static reconstitute(data: {
        id: string;
        enrollmentId: string;
        lessonId: string;
        status: ProgressStatus;
        watchDurationSeconds: number;
        startedAt: Date | null;
        completedAt: Date | null;
    }): LessonProgress {
        return new LessonProgress(
            data.id,
            data.enrollmentId,
            data.lessonId,
            data.status,
            data.watchDurationSeconds,
            data.startedAt,
            data.completedAt
        );
    }

    // Getters
    public get id(): string { return this._id; }
    public get enrollmentId(): string { return this._enrollmentId; }
    public get lessonId(): string { return this._lessonId; }
    public get status(): ProgressStatus { return this._status; }
    public get watchDurationSeconds(): number { return this._watchDurationSeconds; }
    public get startedAt(): Date | null { return this._startedAt; }
    public get completedAt(): Date | null { return this._completedAt; }

    // Business methods
    public markAsStarted(): void {
        if (this._status === ProgressStatus.NOT_STARTED) {
            this._status = ProgressStatus.IN_PROGRESS;
            this._startedAt = new Date();
        }
    }

    public markAsCompleted(): void {
        if (this._status !== ProgressStatus.COMPLETED) {
            this._status = ProgressStatus.COMPLETED;
            this._completedAt = new Date();
            
            if (!this._startedAt) {
                this._startedAt = this._completedAt;
            }
        }
    }

    public updateWatchTime(seconds: number): void {
        if (seconds < 0) {
            throw new Error('Watch duration cannot be negative');
        }
        
        this._watchDurationSeconds = seconds;
        
        if (this._status === ProgressStatus.NOT_STARTED) {
            this.markAsStarted();
        }
    }

    public getCompletionPercentage(lessonDurationMinutes: number): number {
        if (this._status === ProgressStatus.COMPLETED) {
            return 100;
        }
        
        if (this._status === ProgressStatus.NOT_STARTED) {
            return 0;
        }
        
        const lessonDurationSeconds = lessonDurationMinutes * 60;
        const percentage = Math.min((this._watchDurationSeconds / lessonDurationSeconds) * 100, 100);
        return Math.round(percentage);
    }

    public isCompleted(): boolean {
        return this._status === ProgressStatus.COMPLETED;
    }

    public isInProgress(): boolean {
        return this._status === ProgressStatus.IN_PROGRESS;
    }

    public isNotStarted(): boolean {
        return this._status === ProgressStatus.NOT_STARTED;
    }
}