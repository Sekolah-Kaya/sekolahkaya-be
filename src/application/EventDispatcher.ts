import { DomainEvent } from "../domain/common/DomainEvent";

export interface IEventDispatcher {
    dispatch(event: DomainEvent): Promise<void>;
}
