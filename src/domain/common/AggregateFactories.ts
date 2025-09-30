import { Course } from "../course/Course";
import { User } from "../user/User";
import { CourseLevel, Role } from "./enum";

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

export class UserFactory {
    public static createStudent(data: {
        email: string;
        firstName: string;
        lastName: string;
        passwordHash: string;
        phone?: string;
    }): User {
        return User.create({
            ...data,
            role: Role.STUDENT,
        });
    }

    public static createInstructor(data: {
        email: string;
        firstName: string;
        lastName: string;
        passwordHash: string;
        phone?: string;
    }): User {
        return User.create({
            ...data,
            role: Role.INSTRUCTOR,
        });
    }

    public static createAdmin(data: {
        email: string;
        firstName: string;
        lastName: string;
        passwordHash: string;
    }): User {
        return User.create({
            ...data,
            role: Role.ADMIN,
        });
    }
}