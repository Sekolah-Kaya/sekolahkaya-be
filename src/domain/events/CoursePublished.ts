import { DomainEvent } from "./DomainEvent";

export class CoursePublished implements DomainEvent {
    readonly eventId: string = crypto.randomUUID();
    readonly occurredOn: Date = new Date();

    constructor(
        public readonly aggregateId: string,
        public readonly title: string,
        public readonly instructorId: string
    ) {}
}