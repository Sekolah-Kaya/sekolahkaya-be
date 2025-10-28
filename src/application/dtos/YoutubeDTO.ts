import { YoutubeVideoThumbnails } from "../../domain/youtube/YoutubeVideo"

export interface FetchYoutubeRequest {
    url: string
    maxPlaylistVideos?: number
}

export interface YoutubeVideoResponse {
    type: 'video'
    data: {
        id: string
        title: string
        description: string
        thumbnails: YoutubeVideoThumbnails
        duration: string
        durationSeconds: number
        channelTitle: string
        publishedAt: string | Date
        bestThumbnail: string
    }
}

export interface YoutubePlaylistResponse {
    type: 'playlist'
    data: {
        id: string
        title: string
        description: string
        thumbnails: YoutubeVideoThumbnails
        channelTitle: string
        videoCount: number
        totalDuration: string
        videos: Array<{
            id: string
            title: string
            description: string
            thumbnails: YoutubeVideoThumbnails
            duration: string
            durationSeconds: number
            channelTitle: string
            publishedAt: string | Date
            bestThumbnail: string
        }>
    }
}

export type YoutubeResponse = YoutubeVideoResponse | YoutubePlaylistResponse