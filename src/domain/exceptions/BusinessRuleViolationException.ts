import { DomainException } from "./DomainException"

export class BussinessRuleViolationException extends DomainException {
    constructor(rule: string) {
        super(`Bussiness rule violation: ${rule}`)
        this.name = 'BussinessRuleViolationException'
    }
}
