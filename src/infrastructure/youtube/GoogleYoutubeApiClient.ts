import { google, youtube_v3 } from 'googleapis'
import { IYoutubeApiClient } from '../../domain/youtube/IYoutubeApiClient';
import { YoutubeDurationParser } from './YoutubeDurationParser';
import { YoutubeVideo, YoutubeVideoThumbnails } from '../../domain/youtube/YoutubeVideo';

export class GoogleYoutubeApiClient implements IYoutubeApiClient {
    private youtube: youtube_v3.Youtube
    private durationParser: YoutubeDurationParser

    public constructor(apiKey: string) {
        this.youtube = google.youtube({
            version: 'v3',
            auth: apiKey
        })
        this.durationParser = new YoutubeDurationParser()
    }

    async getVideoDetails(videoId: string): Promise<YoutubeVideo> {
        const response = await this.youtube.videos.list({
            part: ['snippet', 'contentDetails'],
            id: [videoId]
        })

        if (!response.data.items || response.data.items.length === 0) {
            throw new Error(`Video not found: ${videoId}`)
        }

        return this.mapToYoutubeVideo(response.data.items[0])
    }

    async getMultipleVideos(videoIds: string[]): Promise<YoutubeVideo[]> {
        if (videoIds.length === 0) {
            return []
        }

        const chunks = this.chunkArray(videoIds, 50)
        const allVideos: YoutubeVideo[] = []

        for (const chunk of chunks) {
            const response = await this.youtube.videos.list({
                part: ['snippet', 'contentDetails'],
                id: chunk
            })

            if (response.data.items) {
                const videos = response.data.items.map(item => this.mapToYoutubeVideo(item))
                allVideos.push(...videos)
            }
        }

        return allVideos
    }

    async getPlaylistVideoIds(playlistId: string, maxResults: number = 50): Promise<string[]> {
        const videoIds: string[] = []
        let pageToken: string | undefined

        do {
            const response = await this.youtube.playlistItems.list({
                part: ['contentDetails'],
                playlistId,
                maxResults: Math.min(maxResults - videoIds.length, 50),
                pageToken
            })

            if (response.data.items) {
                const ids = response.data.items
                    .map(item => item.contentDetails?.videoId)
                    .filter((id): id is string => Boolean(id))

                videoIds.push(...ids)
            }

            pageToken = response.data.nextPageToken || undefined

            if (videoIds.length >= maxResults) {
                break
            }
        } while (pageToken)

        return videoIds.slice(0, maxResults)
    }

    private mapToYoutubeVideo(item: youtube_v3.Schema$Video): YoutubeVideo {
        const snippet = item.snippet!
        const contentDetails = item.contentDetails!

        const thumbnails: YoutubeVideoThumbnails = {
            default: snippet.thumbnails?.default?.url,
            medium: snippet.thumbnails?.medium?.url,
            high: snippet.thumbnails?.high?.url,
            standard: snippet.thumbnails?.standard?.url,
            maxres: snippet.thumbnails?.maxres?.url
        }

        const durationSeconds = this.durationParser.parseToSeconds(contentDetails.duration || 'PT0s')

        return new YoutubeVideo(
            item.id!,
            snippet.title || 'Untitled',
            snippet.description || '',
            thumbnails,
            durationSeconds,
            snippet.channelTitle || 'Unknown Channel',
            new Date(snippet.publishedAt || Date.now())
        )
    }

    private chunkArray<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = []
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size))
        }

        return chunks
    }
}