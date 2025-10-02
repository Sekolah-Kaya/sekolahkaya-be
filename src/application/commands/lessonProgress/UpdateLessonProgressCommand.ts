export interface UpdateLessonProgressCommand {
    userId: string;
    enrollmentId: string;
    lessonId: string;
    watchDurationSeconds: number;
}
