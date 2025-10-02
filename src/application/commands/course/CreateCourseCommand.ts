import { CourseLevel } from "../../../shared/types/Enum";

export interface CreateCourseCommand {
    instructorId: string;
    categoryId: string;
    title: string;
    description?: string;
    price: number;
    thumbnail?: string;
    durationHours: number;
    level: CourseLevel;
}