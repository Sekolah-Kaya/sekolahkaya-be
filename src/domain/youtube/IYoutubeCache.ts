import { YoutubeVideo } from "./YoutubeVideo";

export interface IYoutubeCache {
    getVideo(videoId: string): Promise<YoutubeVideo | null>
    setVideo(videoId: string, video: YoutubeVideo, ttl?: number): Promise<void>

    getPlaylistVideoIds(playlistId: string): Promise<string[]>
    setPlaylistVideoIds(playlistId: string, videoIds: string[], ttl?: number): Promise<void>

    invalidateVideo(videoId: string): Promise<void>
    invalidatePlaylist(PlaylistId: string): Promise<void>
}