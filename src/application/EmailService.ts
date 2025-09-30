import { Course } from "../domain/course/Course";
import { User } from "../domain/user/User";

export interface IEmailService {
    sendWelcomeEmail(user: User): Promise<void>;
    sendEnrollmentConfirmation(user: User, course: Course): Promise<void>;
    sendPasswordChangeNotification(user: User): Promise<void>;
}
