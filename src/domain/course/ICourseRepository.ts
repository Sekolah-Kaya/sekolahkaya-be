import { IGenericRepository } from "../common/IGenericRepository"
import { Lesson } from "../lesson/Lesson"
import { Course } from "./Course"
import { CourseQuery } from "./CourseDTO"

export interface ICourseRepository extends IGenericRepository<Course> {
    findByInstructorId(instructorId: string): Promise<Course[]>
    searchCourses(query: CourseQuery): Promise<{ items: Course[]; total: number }>
    getCourseLessons(courseId: string): Promise<Lesson[]>
}
