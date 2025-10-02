import { DomainEvent } from "./DomainEvent";

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