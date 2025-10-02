export interface UpdateCourseCommand {
    courseId: string;
    instructorId: string; // For authorization
    title?: string;
    description?: string;
    thumbnail?: string;
    durationHours?: number;
}