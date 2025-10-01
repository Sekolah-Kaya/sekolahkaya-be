export interface ValidationRule {
    field: string,
    rules: Array<{
        type: 'required' | 'email' | 'minLength' | 'maxLength' | 'numeric' | 'positive' | 'enum'
        value?: any
        message?: string
    }>
}

export class RequestValidator {
    static validate(data: any, rules: ValidationRule[]): Record<string, string[]> {
        const errors: Record<string, string[]> = {}

        for (const rule of rules) {
            const fieldErrors: string[] = []
            const fieldValue = data[rule.field]

            for (const validation of rule.rules) {
                switch (validation.type) {
                    case 'required':
                        if (!fieldValue || fieldValue.toString().trim() === '') {
                            fieldErrors.push(validation.message || `${rule.field} is required`)
                        }
                        break
                    case 'email':
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (fieldValue && !emailRegex.test(fieldValue)) {
                            fieldErrors.push(validation.message || `${rule.field} must be a valid email`);
                        }
                        break;

                    case 'minLength':
                        if (fieldValue && fieldValue.length < validation.value) {
                            fieldErrors.push(validation.message || `${rule.field} must be at least ${validation.value} characters`);
                        }
                        break;

                    case 'maxLength':
                        if (fieldValue && fieldValue.length > validation.value) {
                            fieldErrors.push(validation.message || `${rule.field} must not exceed ${validation.value} characters`);
                        }
                        break;

                    case 'numeric':
                        if (fieldValue && isNaN(Number(fieldValue))) {
                            fieldErrors.push(validation.message || `${rule.field} must be a number`);
                        }
                        break;

                    case 'positive':
                        if (fieldValue && Number(fieldValue) <= 0) {
                            fieldErrors.push(validation.message || `${rule.field} must be positive`);
                        }
                        break;

                    case 'enum':
                        if (fieldValue && !validation.value.includes(fieldValue)) {
                            fieldErrors.push(validation.message || `${rule.field} must be one of: ${validation.value.join(', ')}`);
                        }
                        break;
                }
            }

            if (fieldErrors.length > 0) {
                errors[rule.field] = fieldErrors
            }
        }
        return errors
    }

}