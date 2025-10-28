import { Router } from 'express'
import { YoutubeController } from '../controller/YoutubeController';
import { DIContainer } from '../../infrastructure/di/DependencyInjectionContainer';
import { AuthenticationMiddleware } from '../middleware/Authentication';

export function createYoutubeRoutes(container: DIContainer): Router {
    const router = Router()
    const youtubeController = new YoutubeController(container.get('IYouTubeService'))
    const authMiddleware = container.get<AuthenticationMiddleware>('AuthenticationMiddleware')

    router.post('/fetch', authMiddleware.authenticate(), (req, res) => youtubeController.fetchYoutubeData(req, res))
    router.post('/validate', authMiddleware.authenticate(),(req, res) => youtubeController.validateYoutubeUrl(req, res))
    router.delete('/cache/video/:videoId', authMiddleware.authenticate(),(req, res) => youtubeController.invalidateVideoCache(req, res))
    router.delete('/cache/playlist/:playlistId', authMiddleware.authenticate(),(req, res) => youtubeController.invalidatePlaylistCache(req, res))

    return router
}