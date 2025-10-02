import { CourseLevel } from "../../shared/types/Enum";
import { Course } from "../models/Course";

export class CourseFactory {
    public static createBasicCourse(data: {
        instructorId: string;
        categoryId: string;
        title: string;
        price: number;
        level: CourseLevel;
    }): Course {
        return Course.create({
            ...data,
            durationHours: 1, // Default minimum duration
        });
    }

    public static createFreeCourse(data: {
        instructorId: string;
        categoryId: string;
        title: string;
        level: CourseLevel;
    }): Course {
        return Course.create({
            ...data,
            price: 0,
            durationHours: 1,
        });
    }
}