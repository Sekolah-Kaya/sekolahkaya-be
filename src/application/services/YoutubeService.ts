import { IYoutubeApiClient } from "../../domain/youtube/IYoutubeApiClient";
import { IYoutubeCache } from "../../domain/youtube/IYoutubeCache";
import { YoutubePlaylis } from "../../domain/youtube/YoutubePlaylist";
import { YoutubeUrlParser, YouTubeUrlType } from "../../domain/youtube/YoutubeUrlParser";
import { YoutubeVideo } from "../../domain/youtube/YoutubeVideo";
import { FetchYoutubeRequest, YoutubePlaylistResponse, YoutubeResponse, YoutubeVideoResponse } from "../dtos/YoutubeDTO";

export interface IYoutubeService {
    fetchYoutubeData(request: FetchYoutubeRequest): Promise<YoutubeResponse>
    invalidateVideo(videoId: string): Promise<void>
    invalidatePlaylist(playlistId: string): Promise<void>
    isValidYoutubeUrl(url: string): boolean
}

export class YoutubeService implements IYoutubeService {
    private urlParser: YoutubeUrlParser

    public constructor(
        private apiClient: IYoutubeApiClient,
        private cache: IYoutubeCache
    ) {
        this.urlParser = new YoutubeUrlParser()
    }

    async fetchYoutubeData(request: FetchYoutubeRequest): Promise<YoutubeResponse> {
        const parsed = this.urlParser.parse(request.url)

        if (parsed.type === YouTubeUrlType.INVALID) {
            throw new Error('Invalid Youtube URL')
        }

        if (parsed.type === YouTubeUrlType.VIDEO) {
            return this.fetchVideoData(parsed.videoId!)
        }

        if (parsed.type === YouTubeUrlType.PLAYLIST) {
            return this.fetchPlaylistData(parsed.playlistId!)
        }

        throw new Error('Unable to process YouTube URL')
    }

    private async fetchVideoData(videoId: string): Promise<YoutubeVideoResponse> {
        let video = await this.cache.getVideo(videoId)
        if (!video) {
            video = await this.apiClient.getVideoDetails(videoId)
            await this.cache.setVideo(videoId, video)
        }

        return {
            type: 'video',
            data: video.toJSON()
        }
    }

    private async fetchPlaylistData(playlistId: string, maxVideos: number = 50): Promise<YoutubePlaylistResponse> {
        let videoIds = await this.cache.getPlaylistVideoIds(playlistId)
        if (!videoIds) {
            videoIds = await this.apiClient.getPlaylistVideoIds(playlistId, maxVideos)
            await this.cache.setPlaylistVideoIds(playlistId, videoIds)
        }

        const videos = await this.fetchVideosWithCache(videoIds)

        const playlist = new YoutubePlaylis(
            playlistId,
            'Playlist', // Could fetch real title with playlistItems.list
            '',
            videos[0]?.thumbnails || {},
            videos[0]?.channelTitle || 'Unknown',
            videos
        )

        return {
            type: 'playlist',
            data: playlist.toJSON()
        }
    }

    private async fetchVideosWithCache(videoIds: string[]): Promise<YoutubeVideo[]> {
        const videos: YoutubeVideo[] = []
        const uncachedIds: string[] = []

        for (const videoId of videoIds) {
            const cached = await this.cache.getVideo(videoId)
            if (cached) {
                videos.push(cached)
            } else {
                uncachedIds.push(videoId)
            }
        }

        if (uncachedIds.length > 0) {
            const fetchedVideos = await this.apiClient.getMultipleVideos(uncachedIds)

            for (const video of fetchedVideos) {
                await this.cache.setVideo(video.id, video)
                videos.push(video)
            }
        }

        const videoMap = new Map(videos.map(v => [v.id, v]))
        return videoIds.map(id => videoMap.get(id)!).filter(Boolean)
    }

    async invalidateVideo(videoId: string): Promise<void> {
        await this.cache.invalidateVideo(videoId)
    }

    async invalidatePlaylist(playlistId: string): Promise<void> {
        await this.cache.invalidatePlaylist(playlistId)
    }

    isValidYoutubeUrl(url: string): boolean {
        return this.urlParser.isValid(url)
    }
}