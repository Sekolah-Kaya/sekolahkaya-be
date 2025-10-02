import { Router } from "express";
import { DIContainer } from "../../infrastructure/di/DependencyInjectionContainer";
import { EnrollmentController } from "../controller/EnrollmentController";
import { AuthenticationMiddleware } from "../middleware/Authentication";

export function createEnrollmentRoutes(container: DIContainer): Router {
    const router = Router();
    const enrollmentController = new EnrollmentController(container.get('IEnrollmentApplicationService'));
    const authMiddleware = container.get<AuthenticationMiddleware>('AuthenticationMiddleware')

    router.post('/enroll', authMiddleware.authenticate(), (req, res) => enrollmentController.enrollCourse(req, res));
    router.get('/my-enrollments', authMiddleware.authenticate(), (req, res) => enrollmentController.getMyEnrollments(req, res));
    router.get('/:id/progress', authMiddleware.authenticate(), (req, res) => enrollmentController.getEnrollmentProgress(req, res));
    router.put('/lesson-progress', authMiddleware.authenticate(), (req, res) => enrollmentController.updateLessonProgress(req, res));
    router.post('/complete-lesson', authMiddleware.authenticate(), (req, res) => enrollmentController.completeLesson(req, res));
    router.delete('/:id', authMiddleware.authenticate(), (req, res) => enrollmentController.cancelEnrollment(req, res));

    return router;
}
