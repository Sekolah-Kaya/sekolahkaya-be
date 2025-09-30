import { Lesson } from "./Lesson"
import { IGenericRepository } from "../common/IGenericRepository"

export interface ILessonRepository extends IGenericRepository<Lesson> {
    findByCourseId(courseId: string): Promise<Lesson[]>;
}
