import { ApplicationResult, PaginatedResult } from "../common/ResultObject";
import { Course } from "./Course";
import { CourseQuery, CreateCourseCommand, PublishCourseCommand, UpdateCourseCommand } from "./CourseDTO";

export interface ICourseApplicationService {
    createCourse(command: CreateCourseCommand): Promise<ApplicationResult<Course>>;
    updateCourse(command: UpdateCourseCommand): Promise<ApplicationResult<Course>>;
    publishCourse(command: PublishCourseCommand): Promise<ApplicationResult<Course>>;
    getCourseById(id: string): Promise<ApplicationResult<Course>>;
    searchCourses(query: CourseQuery): Promise<ApplicationResult<PaginatedResult<Course>>>;
    getInstructorCourses(instructorId: string): Promise<ApplicationResult<Course[]>>;
    archiveCourse(courseId: string, instructorId: string): Promise<ApplicationResult<Course>>;
}