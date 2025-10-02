export class Email {
    private constructor (private readonly value: string) {}

    public static create(email: string): Email {
        if (!this.isValid(email)) {
            throw new Error('Invalid email format')
        }

        return new Email(email.toLowerCase().trim())
    }

    private static isValid(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    public getValue(): string {
        return this.value
    }

    public equals(other: Email): boolean {
        return this.value === other.value
    }
}