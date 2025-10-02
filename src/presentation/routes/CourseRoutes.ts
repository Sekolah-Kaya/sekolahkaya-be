import { Router } from "express";
import { DIContainer } from "../../infrastructure/di/DependencyInjectionContainer";
import { CourseController } from "../controller/CourseController";
import { AuthenticationMiddleware } from "../middleware/Authentication";

export function createCourseRoutes(container: DIContainer): Router {
    const router = Router()
    const courseController = new CourseController(container.get('ICourseApplicationService'))
    const authMiddleware = container.get<AuthenticationMiddleware>('AuthenticationMiddleware')

    router.post('/', authMiddleware.authenticate(), (req, res) => courseController.createCourse(req, res))
    router.put('/:id', authMiddleware.authenticate(), (req, res) => courseController.updateCourse(req, res))
    router.post('/:id/publish', authMiddleware.authenticate(), (req, res) => courseController.publishCourse(req, res))
    router.post('/:id/archive', authMiddleware.authenticate(), (req, res) => courseController.archiveCourse(req, res));
    router.get('/search', (req, res) => courseController.searchCourses(req, res));
    router.get('/my-courses', authMiddleware.authenticate(), (req, res) => courseController.getInstructorCourses(req, res));
    router.get('/:id', (req, res) => courseController.getCourse(req, res));

    return router;
}