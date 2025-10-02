import { DomainException } from "./DomainException"

export class InvalidOperationException extends DomainException {
    constructor(operation: string) {
        super(`Invalid operation: ${operation}`)
        this.name = 'InvalidOperationException'
    }
}