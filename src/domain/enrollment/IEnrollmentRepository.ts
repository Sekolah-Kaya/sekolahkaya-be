import { Enrollment } from "./Enrollment"
import { IGenericRepository } from "../common/IGenericRepository"

export interface IEnrollmentRepository extends IGenericRepository<Enrollment> {
    findByUserId(userId: string): Promise<Enrollment[]>;
    findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null>;
}
