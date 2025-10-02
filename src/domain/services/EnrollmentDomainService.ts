import { Course } from "../models/Course";
import { User } from "../models/User";
import { Money } from "../value-objects/Money";

export class EnrollmentDomainService {
    public static canUserEnrollCourse(user: User, course: Course): boolean {
        if (!user.isActive) {
            return false
        }

        if (!course.canEnroll()) {
            return false
        }

        if (user.isInstructor() && course.instructorId === user.id) {
            return false
        }

        return true
    }

    public static calculateEnrollmentPrice(course: Course, user: User): Money {
        if (user.isInstructor() && course.instructorId !== user.id) {
            return Money.zero()
        }

        return course.price
    }
}