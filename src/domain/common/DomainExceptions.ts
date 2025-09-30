export class DomainException extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'DomainException'
    }
}

export class BussinessRuleViolationException extends DomainException {
    constructor(rule: string) {
        super(`Bussiness rule violation: ${rule}`)
        this.name = 'BussinessRuleViolationException'
    }
}

export class InvalidOperationException extends DomainException {
    constructor(operation: string) {
        super(`Invalid operation: ${operation}`)
        this.name = 'InvalidOperationException'
    }
}