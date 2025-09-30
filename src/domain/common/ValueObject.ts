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

export class Money {
    private constructor (private readonly amount: number) {}

    public static create(amount: number): Money {
        if (amount < 0) {
            throw new Error('Amount cannot be negative')
        }

        return new Money(amount)
    }

    public static zero(): Money {
        return new Money(0)
    }

    public getValue(): number {
        return this.amount
    }

    public isFree(): boolean {
        return this.amount === 0
    }

    public add(other: Money): Money {
        return new Money(this.amount + other.amount)
    }

    public subtract(other: Money): Money {
        if (this.amount < other.amount) {
            throw new Error('Insufficient amount')
        }

        return new Money(this.amount - other.amount)
    }

    public equals(other: Money): boolean {
        return this.amount === other.amount
    }
}