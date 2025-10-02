import { Role } from "../../shared/types/Enum";
import { User } from "../models/User";

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