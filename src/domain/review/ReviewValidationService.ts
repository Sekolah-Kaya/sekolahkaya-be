import { Course } from "../course/Course";
import { Enrollment } from "../enrollment/Enrollment";
import { User } from "../user/User";

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