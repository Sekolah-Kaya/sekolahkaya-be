import { Router } from "express"
import { UserController } from "../infrastructure/controller/UserController"
import { authenticateToken } from "../middleware/authenticateToken"
import { DIContainer } from "../infrastructure/DependencyInjectionContainer"

export function createUserRoutes(container: DIContainer): Router {
    const router = Router()
    const userController = new UserController(container.get('IUserApplicationService'))

    router.post('/register', (req, res) => userController.register(req, res))
    router.get('/profile', authenticateToken, (req, res) => userController.getProfile(req, res))
    router.put('/profile', authenticateToken, (req, res) => userController.updateProfile(req, res))
    router.put('/change-password', authenticateToken, (req,res) => userController.changePassword(req, res))

    return router
}