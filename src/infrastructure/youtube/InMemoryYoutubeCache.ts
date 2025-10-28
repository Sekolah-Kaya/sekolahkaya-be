import { IYoutubeCache } from "../../domain/youtube/IYoutubeCache";
import { YoutubeVideo } from "../../domain/youtube/YoutubeVideo";

export class InMemoryYoutubeCache implements IYoutubeCache {
    private videoCache = new Map<string, {data: YoutubeVideo; expiresAt: number}>()
    private playlistCache = new Map<string, {data: string[]; expiresAt: number}>()
    private readonly DEFAULT_TTL = 86400000

    async getVideo(videoId: string): Promise<YoutubeVideo | null> {
        const cached = this.videoCache.get(videoId)
        
        if (!cached) return null

        if (Date.now() > cached.expiresAt) {
            this.videoCache.delete(videoId)
            return null
        }

        return cached.data
    }

    async setVideo(videoId: string, video: YoutubeVideo, ttl?: number): Promise<void> {
        this.videoCache.set(videoId, {data: video, expiresAt: Date.now() + (ttl! * 1000)})    
    }

    async getPlaylistVideoIds(playlistId: string): Promise<string[]> {
        const cached = this.playlistCache.get(playlistId)
        if (!cached) return []

        if (Date.now() > cached.expiresAt) {
            this.playlistCache.delete(playlistId)
            return []
        }

        return cached.data
    }

    async setPlaylistVideoIds(playlistId: string, videoIds: string[], ttl?: number): Promise<void> {
        this.playlistCache.set(playlistId, {data: videoIds, expiresAt: Date.now() + (ttl! * 1000)})
    }

    async invalidateVideo(videoId: string): Promise<void> {
        this.videoCache.delete(videoId)
    }

    async invalidatePlaylist(PlaylistId: string): Promise<void> {
        this.playlistCache.delete(PlaylistId)
    }
}