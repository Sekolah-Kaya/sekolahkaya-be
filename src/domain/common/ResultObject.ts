export interface ApplicationResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    validationErrors?: Record<string, string[]>;
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
