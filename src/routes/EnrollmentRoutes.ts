import { Router } from "express";
import { DIContainer } from "../infrastructure/DependencyInjectionContainer";
import { EnrollmentController } from "../infrastructure/controller/EnrollmentController";
import { authenticateToken } from "../middleware/authenticateToken";

export function createEnrollmentRoutes(container: DIContainer): Router {
    const router = Router();
    const enrollmentController = new EnrollmentController(container.get('IEnrollmentApplicationService'));

    router.post('/enroll', authenticateToken, (req, res) => enrollmentController.enrollCourse(req, res));
    router.get('/my-enrollments', authenticateToken, (req, res) => enrollmentController.getMyEnrollments(req, res));
    router.get('/:id/progress', authenticateToken, (req, res) => enrollmentController.getEnrollmentProgress(req, res));
    router.put('/lesson-progress', authenticateToken, (req, res) => enrollmentController.updateLessonProgress(req, res));
    router.post('/complete-lesson', authenticateToken, (req, res) => enrollmentController.completeLesson(req, res));
    router.delete('/:id', authenticateToken, (req, res) => enrollmentController.cancelEnrollment(req, res));

    return router;
}
