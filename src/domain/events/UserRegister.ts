import { Role } from "../../shared/types/Enum"
import { DomainEvent } from "./DomainEvent"

export class UserRegistered implements DomainEvent {
    readonly eventId: string = crypto.randomUUID()
    readonly occurredOn: Date = new Date()

    public constructor(
        public readonly aggregateId: string,
        public readonly email: string,
        public readonly role: Role
    ) {}
}