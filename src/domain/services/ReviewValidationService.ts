import { Course } from "../models/Course";
import { Enrollment } from "../models/Enrollment";
import { User } from "../models/User";

export class ReviewValidationService {
    public static canUserReviewCourse(user: User, course: Course, enrollment?: Enrollment): boolean {
        if (!user.isActive) {
            return false
        }

        if (!enrollment || !enrollment.isActive()) {
            return false
        }

        if (enrollment.progressPercentage === 0) {
            return false
        }

        return true
    }
}