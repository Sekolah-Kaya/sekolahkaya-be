export interface UpdateLessonCommand {
    lessonId: string;
    instructorId: string;
    title?: string;
    description?: string;
    videoUrl?: string;
    content?: string;
    durationMinutes?: number;
    isPreview?: boolean;
}
