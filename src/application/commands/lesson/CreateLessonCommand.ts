export interface CreateLessonCommand {
    courseId: string;
    instructorId: string; // For authorization
    title: string;
    description?: string;
    videoUrl?: string;
    content?: string;
    orderNumber: number;
    durationMinutes: number;
    isPreview?: boolean;
}