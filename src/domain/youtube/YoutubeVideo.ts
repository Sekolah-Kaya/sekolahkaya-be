export interface YoutubeVideoThumbnails {
    default?: string | null
    medium?: string | null
    high?: string | null
    standard?: string | null
    maxres?: string | null
}

export class YoutubeVideo {
    public constructor(
        public readonly id: string, 
        public readonly title: string,
        public readonly description: string,
        public readonly thumbnails: YoutubeVideoThumbnails,
        public readonly durationSeconds: number,
        public readonly channelTitle: string,
        public readonly publishedAt: Date,
    ) {}

    getFormattedDuration(): string {
        const hours = Math.floor(this.durationSeconds / 3600)
        const minutes = Math.floor(this.durationSeconds % 3600 / 60)
        const seconds = this.durationSeconds % 60

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        }

        return `${minutes}:${String(seconds).padStart(2, '0')}`
    }

    getBestThumbnail(): string {
        return (
            this.thumbnails.maxres ||
            this.thumbnails.standard ||
            this.thumbnails.high ||
            this.thumbnails.medium ||
            this.thumbnails.default ||
            ''            
        )
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            thumbnails: this.thumbnails,
            duration: this.getFormattedDuration(),
            durationSeconds: this.durationSeconds,
            channelTitle: this.channelTitle,
            publishedAt: this.publishedAt,
            bestThumbnail: this.getBestThumbnail()
        }
    }
}