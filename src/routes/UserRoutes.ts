import { Router } from "express"
import { UserController } from "../infrastructure/controller/UserController"
import { AuthenticationMiddleware } from "../middleware/Authentication"
import { DIContainer } from "../infrastructure/DependencyInjectionContainer"

export function createUserRoutes(container: DIContainer): Router {
    const router = Router()
    const userController = new UserController(container.get('IUserApplicationService'))
    const authMiddleware = container.get<AuthenticationMiddleware>('AuthenticationMiddleware')

    router.post('/register', (req, res) => userController.register(req, res))
    router.get('/profile', authMiddleware.authenticate(), (req, res) => userController.getProfile(req, res))
    router.put('/profile', authMiddleware.authenticate(), (req, res) => userController.updateProfile(req, res))
    router.put('/change-password', authMiddleware.authenticate(), (req,res) => userController.changePassword(req, res))

    return router
}