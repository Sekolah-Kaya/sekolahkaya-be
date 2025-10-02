import { Router } from "express";
import { DIContainer } from "../../infrastructure/di/DependencyInjectionContainer";
import { AuthController } from "../controller/AuthController";
import { AuthenticationMiddleware } from "../middleware/Authentication";

export function createAuthRoutes(container: DIContainer): Router {
    const router = Router()
    const authController = new AuthController(
        container.get('IAuthenticationService'),
        container.get('IUserApplicationService')
    )
    const authMiddleware = container.get<AuthenticationMiddleware>('AuthenticationMiddleware')

    router.post('/register', (req, res) => authController.register(req, res))
    router.post('/login', (req, res) => authController.login(req, res));
    router.post('/logout', authMiddleware.authenticate(), (req, res) => authController.logout(req, res));
    router.post('/logout-all', authMiddleware.authenticate(), (req, res) => authController.logoutAll(req, res));
    router.post('/refresh-token', (req, res) => authController.refreshToken(req, res));
    router.get('/me', authMiddleware.authenticate(), (req, res) => authController.getMe(req, res));

    return router;
}