import { EnrollmentStatus } from "../common/enum";
import { LessonProgress } from "../lesson_progress/LessonProgress";
import { Enrollment } from "./Enrollment";

export interface EnrollmentProgressDTO {
    enrollment: Enrollment;
    lessonProgresses: LessonProgress[];
    completedLessons: number;
    totalLessons: number;
    progressPercentage: number;
    certificate?: string;
}

export interface EnrollCourseCommand {
    userId: string;
    courseId: string;
}

export interface EnrollmentQuery {
    userId?: string;
    courseId?: string;
    status?: EnrollmentStatus;
    limit?: number;
    offset?: number;
}
