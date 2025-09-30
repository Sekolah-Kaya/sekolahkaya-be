export interface UpdateLessonProgressCommand {
    userId: string;
    enrollmentId: string;
    lessonId: string;
    watchDurationSeconds: number;
}

export interface CompleteLessonCommand {
    userId: string;
    enrollmentId: string;
    lessonId: string;
}
