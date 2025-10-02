import { Course } from "../../domain/models/Course";
import { User } from "../../domain/models/User";

export interface IEmailService {
    sendWelcomeEmail(user: User): Promise<void>;
    sendEnrollmentConfirmation(user: User, course: Course): Promise<void>;
    sendPasswordChangeNotification(user: User): Promise<void>;
}
