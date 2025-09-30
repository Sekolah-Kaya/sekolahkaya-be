import { IGenericRepository } from "../common/IGenericRepository";
import { LessonProgress } from "./LessonProgress";

export interface ILessonProgressRepository extends IGenericRepository<LessonProgress> {
    findByEnrollmentId(enrollmentId: string): Promise<LessonProgress[]>;
    findByEnrollmentAndLesson(enrollmentId: string, lessonId: string): Promise<LessonProgress | null>;
}
