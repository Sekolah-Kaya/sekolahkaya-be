import { LessonProgress } from "./LessonProgress";

export class ProgressCalculationService {
    public static calculateCourseProgress(LessonProgresses: LessonProgress[], totalLessons: number): number {
        if (totalLessons === 0) return 0

        const completedLessons = LessonProgresses.filter(progress => progress.isCompleted()).length
        return Math.round((completedLessons / totalLessons) * 100)
    }

    public static shouldCompleteEnrollment(progressPercentage: number): boolean {
        return progressPercentage >= 100
    }
}