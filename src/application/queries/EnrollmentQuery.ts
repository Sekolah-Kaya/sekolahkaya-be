import { EnrollmentStatus } from "../../shared/types/Enum";

export interface EnrollmentQuery {
    userId?: string;
    courseId?: string;
    status?: EnrollmentStatus;
    limit?: number;
    offset?: number;
}
