import { Router } from 'express'
import { YoutubeController } from '../controller/YoutubeController';
import { DIContainer } from '../../infrastructure/di/DependencyInjectionContainer';
import { AuthenticationMiddleware } from '../middleware/Authentication';

export function createYoutubeRoutes(container: DIContainer): Router {
    const router = Router()
    const youtubeController = new YoutubeController(container.get('IYoutubeService'))
    const authMiddleware = container.get<AuthenticationMiddleware>('AuthenticationMiddleware')

    router.post('/fetch', authMiddleware.authenticate, youtubeController.fetchYoutubeData)
    router.post('/validate', authMiddleware.authenticate, youtubeController.validateYoutubeUrl)
    router.delete('/cache/video/:videoId', authMiddleware.authenticate, youtubeController.invalidateVideoCache)
    router.delete('/cache/playlist/:playlistId', authMiddleware.authenticate, youtubeController.invalidatePlaylistCache)

    return router
}