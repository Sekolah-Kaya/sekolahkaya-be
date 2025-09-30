import { Role } from "./enum"

export interface DomainEvent {
    readonly eventId: string
    readonly occurredOn: Date
    readonly aggregateId: string
}

export class UserRegistered implements DomainEvent {
    readonly eventId: string = crypto.randomUUID()
    readonly occurredOn: Date = new Date()

    public constructor(
        public readonly aggregateId: string,
        public readonly email: string,
        public readonly role: Role
    ) {}
}

export class CoursePublished implements DomainEvent {
    readonly eventId: string = crypto.randomUUID();
    readonly occurredOn: Date = new Date();

    constructor(
        public readonly aggregateId: string,
        public readonly title: string,
        public readonly instructorId: string
    ) {}
}

export class UserEnrolled implements DomainEvent {
    readonly eventId: string = crypto.randomUUID();
    readonly occurredOn: Date = new Date();

    public constructor(
        public readonly aggregateId: string,
        public readonly userId: string,
        public readonly courseId: string,
        public readonly amountPaid: number
    ) {}
}