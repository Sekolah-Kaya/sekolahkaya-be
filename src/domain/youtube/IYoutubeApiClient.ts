import { YoutubeVideo } from "./YoutubeVideo";

export interface IYoutubeVideoApi {
    getVideoDetails(videoId: string): Promise<YoutubeVideo>
    getMultipleVideos(videoIds: string[]): Promise<YoutubeVideo[]>
}

export interface IYoutubePlaylistApi {
    getPlaylistVideoIds(playlistId: string, maxResults?: number): Promise<string[]>
}

export interface IYoutubeApiClient extends IYoutubeVideoApi, IYoutubePlaylistApi {}