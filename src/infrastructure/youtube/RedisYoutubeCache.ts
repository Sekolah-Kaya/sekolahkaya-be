import Redis from "ioredis"
import { IYoutubeCache } from "../../domain/youtube/IYoutubeCache";
import { YoutubeVideo } from "../../domain/youtube/YoutubeVideo";

export class RedisYoutubeCache implements IYoutubeCache {
    private readonly VIDEO_PREFIX = 'youtube:video:'
    private readonly PLAYLIST_PREFIX = 'youtube:playlist:'
    private readonly DEFAULT_TTL = 86400

    public constructor(private redis: Redis) {}

    async getVideo(videoId: string): Promise<YoutubeVideo | null> {
        const key = this.VIDEO_PREFIX + videoId
        const cached = await this.redis.get(key)

        if (!cached) return null

        try {
            const data = JSON.parse(cached)
            
            return new YoutubeVideo(
                data.id,
                data.title,
                data.description,
                data.thumbnails,
                data.durationSeconds,
                data.channelTitle,
                new Date(data.publishedAt)
            )
        } catch (error) {
            console.error('Failed to parse cache video:', error)
            return null
        }
    }

    async setVideo(videoId: string, video: YoutubeVideo, ttl?: number): Promise<void> {
        const key = this.VIDEO_PREFIX + videoId
        const data = JSON.stringify(video.toJSON())
        await this.redis.setex(key, ttl!, data) 
    }

    async getPlaylistVideoIds(playlistId: string): Promise<string[]> {
        const key = this.PLAYLIST_PREFIX + playlistId
        const cached = await this.redis.get(key)

        if (!cached) return []

        try {
            return JSON.parse(cached)
        } catch (error) {
            console.error('Failed to parse cached playlist', error)
            return []
        }
    }

    async setPlaylistVideoIds(playlistId: string, videoIds: string[], ttl?: number): Promise<void> {
        const key = this.PLAYLIST_PREFIX + playlistId
        const data = JSON.stringify(videoIds)
        await this.redis.setex(key, ttl!, data)
    }

    async invalidateVideo(videoId: string): Promise<void> {
        const key = this.VIDEO_PREFIX + videoId
        await this.redis.del(key)
    }

    async invalidatePlaylist(PlaylistId: string): Promise<void> {
        const key = this.PLAYLIST_PREFIX + PlaylistId
        await this.redis.del(key)
    }
}
