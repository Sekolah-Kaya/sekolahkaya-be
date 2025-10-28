import { YoutubeVideo, YoutubeVideoThumbnails } from "./YoutubeVideo";

export class YoutubePlaylis {
    public constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly description: string,
        public readonly thumbnails: YoutubeVideoThumbnails,
        public readonly channelTitle: string,
        public readonly videos: YoutubeVideo[]
    ) {}

    getVideoCount(): number {
        return this.videos.length
    }

    getTotalDuration(): number {
        return this.videos.reduce((sum, video) => sum + video.durationSeconds, 0)
    }

    getFormattedTotalDuration(): string {
        const totalSeconds = this.getTotalDuration()
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor(totalSeconds % 3600 / 60)

        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        return `${minutes}m`
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            thumbnails: this.thumbnails,
            channelTitle: this.channelTitle,
            videoCount: this.getVideoCount(),
            totalDuration: this.getFormattedTotalDuration(),
            videos: this.videos.map(v => v.toJSON())
        }
    }
}