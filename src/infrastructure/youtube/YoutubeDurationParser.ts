export class YoutubeDurationParser {
    parseToSeconds(duration: string): number {
        if (!duration || !duration.startsWith('PT')) {
            return 0
        }

        const timeString = duration.substring(2)

        const hoursMatch = timeString.match(/(\d+)H/)
        const minutesMatch = timeString.match(/(\d+)M/)
        const secondsMatch = timeString.match(/(\d+)S/)

        const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0
        const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0
        const seconds = secondsMatch ? parseInt(secondsMatch[1], 10) : 0

        return hours * 3600 + minutes * 60 + seconds
    }

    formatSeconds(second: number): string {
        const hours = Math.floor(second / 3600)
        const minutes = Math.floor(second % 3600 / 60)
        const secs = second % 60

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        }
        return `${minutes}:${String(secs).padStart(2, '0')}`
    }

    isValidDuration(duration: string): boolean {
        return /^PT(?:\d+H)?(?:\d+M)?(?:\d+S)?$/.test(duration)
    }
}