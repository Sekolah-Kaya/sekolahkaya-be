import { IEventDispatcher } from "../../shared/interface/IEventDispatcher";
import { DomainEvent } from "../../domain/events/DomainEvent";

export class SimpleEventDispatcher implements IEventDispatcher {
    private handlers: Map<string, Array<(event: DomainEvent) => Promise<void>>> = new Map()

    registerHandler<T extends DomainEvent>(
        eventType: string,
        handler: (event: T) => Promise<void>
    ): void {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, [])
        } 

        this.handlers.get(eventType)!.push(handler as any)
    }

    async dispatch(event: DomainEvent): Promise<void> {
        const eventType = event.constructor.name
        const handlers = this.handlers.get(eventType) || []

        await Promise.all(
            handlers.map(handler => handler(event).catch(error => {
                console.error(`Error in event handler for ${eventType}: `, error)
            }))
        )
    }
}