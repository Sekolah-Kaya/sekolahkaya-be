import { ApplicationResult } from "../common/ResultObject";
import { LessonProgress } from "../lesson_progress/LessonProgress";
import { CompleteLessonCommand, UpdateLessonProgressCommand } from "../lesson_progress/LessonProgressDTO";
import { Enrollment } from "./Enrollment";
import { EnrollCourseCommand, EnrollmentProgressDTO } from "./EnrollmentDTO";

export interface IEnrollmentApplicationService {
    enrollCourse(command: EnrollCourseCommand): Promise<ApplicationResult<Enrollment>>;
    updateLessonProgress(command: UpdateLessonProgressCommand): Promise<ApplicationResult<LessonProgress>>;
    completeLesson(command: CompleteLessonCommand): Promise<ApplicationResult<LessonProgress>>;
    getUserEnrollments(userId: string): Promise<ApplicationResult<Enrollment[]>>;
    getEnrollmentProgress(enrollmentId: string, userId: string): Promise<ApplicationResult<EnrollmentProgressDTO>>;
    cancelEnrollment(enrollmentId: string, userId: string): Promise<ApplicationResult<boolean>>;
}
