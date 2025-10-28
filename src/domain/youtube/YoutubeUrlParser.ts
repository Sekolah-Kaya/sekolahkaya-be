export enum YouTubeUrlType {
    VIDEO = 'VIDEO',
    PLAYLIST = 'PLAYLIST',
    INVALID = 'INVALID'
}

export interface ParsedYoutubeUrl {
    type: YouTubeUrlType
    videoId?: string
    playlistId?: string
    originalUrl: string
}

export class YoutubeUrlParser {
    private readonly VIDEO_PATTERNS = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ]

    private readonly PLAYLIST_PATTERNS = /[?&]list=([a-zA-Z0-9_-]+)/

    parse(url: string): ParsedYoutubeUrl {
        if (!url || typeof url !== 'string') {
            return this.createInvalidResult(url)
        }

        const normalizedUrl = url.trim()

        const playlistMatch = normalizedUrl.match(this.PLAYLIST_PATTERNS)
        if (playlistMatch) {
            return {
                type: YouTubeUrlType.PLAYLIST,
                playlistId: playlistMatch[1],
                originalUrl: normalizedUrl
            }
        }

        for (const pattern of this.VIDEO_PATTERNS) {
            const match = normalizedUrl.match(pattern)
            if (match) {
                return {
                    type: YouTubeUrlType.VIDEO,
                    videoId: match[1],
                    originalUrl: normalizedUrl
                }
            }
        }

        return this.createInvalidResult(normalizedUrl)
    }

    private createInvalidResult(url: string): ParsedYoutubeUrl {
        return {
            type: YouTubeUrlType.INVALID,
            originalUrl: url
        }
    }

    isValid(url: string): boolean {
        return this.parse(url).type !== YouTubeUrlType.INVALID
    }
}