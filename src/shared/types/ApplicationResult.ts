export interface ApplicationResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    validationErrors?: Record<string, string[]>;
}