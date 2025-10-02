import { EnrollmentStatus } from "../../shared/types/Enum";
import { LessonProgress } from "../../domain/models/LessonProgress";
import { Enrollment } from "../../domain/models/Enrollment";

export interface EnrollmentProgressDTO {
    enrollment: Enrollment;
    lessonProgresses: LessonProgress[];
    completedLessons: number;
    totalLessons: number;
    progressPercentage: number;
    certificate?: string;
}