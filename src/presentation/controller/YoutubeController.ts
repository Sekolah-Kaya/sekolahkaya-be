import { Request, Response } from 'express'
import { YoutubeService } from '../../application/services/YoutubeService';
import { FetchYoutubeRequest } from '../../application/dtos/YoutubeDTO';

export class YoutubeController {
    public constructor(private youtubeService: YoutubeService) { }

    /**
     * POST /api/youtube/fetch
     * Body: { url: string, maxPlaylistVideos?: number }
     */
    fetchYoutubeData = async (req: Request, res: Response): Promise<void> => {
        try {
            const { url, maxPlaylistVideos } = req.body
            if (!url || typeof url !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'URL is required and must be a string'
                })

                return
            }

            if (!this.youtubeService.isValidYoutubeUrl(url)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid YouTube URL. Please provide a valid video or playlist URL.'
                })

                return
            }

            const request: FetchYoutubeRequest = {
                url,
                maxPlaylistVideos: maxPlaylistVideos || 50
            }

            const result = await this.youtubeService.fetchYoutubeData(request)

            res.status(200).json({
                success: true,
                data: result
            })
        } catch (error) {
            console.error('Error fetching YouTube data:', error)

            if (error instanceof Error) {
                if (error.message.includes('not found')) {
                    res.status(404).json({
                        success: false,
                        message: 'Youtube video or playlist not found'
                    })
                    return
                }

                if (error.message.includes('quota')) {
                    res.status(429).json({
                        success: false,
                        message: 'YouTube API quota exceeded. Please try again later.'
                    })
                    return
                }
            }

            res.status(500).json({
                success: false,
                message: 'Failed to fetch Youtube data. Please try again later'
            })
        }
    }

    /**
     * POST /api/youtube/validate
     * Body: { url: string }
     */
    validateYoutubeUrl = async (req: Request, res: Response): Promise<void> => {
        try {
            const { url } = req.body
            if (!url || typeof url !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'URL is required and must be a string'
                })
                return
            }

            const isValid = this.youtubeService.isValidYoutubeUrl(url)

            res.status(200).json({
                success: true,
                data: { isValid }
            })
        } catch (error) {
            console.error('Error validating YouTube URL:', error)
            res.status(500).json({
                success: false,
                message: 'Failed to validate URL'
            })
        }
    }

    /**
     * DELETE /api/youtube/cache/video/:videoId
     */
    invalidateVideoCache = async (req: Request, res: Response): Promise<void> => {
        try {
            const { videoId } = req.params

            if (!videoId) {
                res.status(400).json({
                    success: false,
                    message: 'Video ID is required'
                })
                return
            }

            await this.youtubeService.invalidateVideo(videoId)

            res.status(200).json({
                success: true,
                message: 'Video cache invalidated successfully'
            })
        } catch (error) {
            console.error('Error invalidating video cache:', error)
            res.status(500).json({
                success: false,
                message: 'Failed to invalidate cache'
            })
        }
    }

    /**
     * DELETE /api/youtube/cache/playlist/:playlistId
     */
    invalidatePlaylistCache = async (req: Request, res: Response): Promise<void> => {
        try {
            const { playlistId } = req.params

            if (!playlistId) {
                res.status(400).json({
                    success: false,
                    message: 'Playlist ID is required'
                })
                return
            }

            await this.youtubeService.invalidatePlaylist(playlistId)

            res.status(200).json({
                success: true,
                message: 'Playlist cache invalidated successfully'
            })
        } catch (error) {
            console.error('Error invalidating playlist cache:', error)
            res.status(500).json({
                success: false,
                message: 'Failed to invalidate cache'
            })
        }
    }
}