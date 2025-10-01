import { Router } from "express";
import { DIContainer } from "../infrastructure/DependencyInjectionContainer";
import { CourseController } from "../infrastructure/controller/CourseController";
import { authenticateToken } from "../middleware/authenticateToken";

export function createCourseRoutes(container: DIContainer): Router {
    const router = Router()
    const courseController = new CourseController(container.get('ICourseApplicationService'))

    router.post('/', authenticateToken, (req, res) => courseController.createCourse(req, res))
    router.put('/:id', authenticateToken, (req, res) => courseController.updateCourse(req, res))
    router.post('/:id/publish', authenticateToken, (req, res) => courseController.publishCourse(req, res))
    router.post('/:id/archive', authenticateToken, (req, res) => courseController.archiveCourse(req, res));
    router.get('/search', (req, res) => courseController.searchCourses(req, res));
    router.get('/my-courses', authenticateToken, (req, res) => courseController.getInstructorCourses(req, res));
    router.get('/:id', (req, res) => courseController.getCourse(req, res));

    return router;
}