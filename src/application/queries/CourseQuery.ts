import { CourseLevel, CourseStatus } from "../../shared/types/Enum";

export interface CourseQuery {
    search?: string;
    categoryId?: string;
    level?: CourseLevel;
    priceRange?: [number, number];
    instructorId?: string;
    status?: CourseStatus;
    limit?: number;
    offset?: number;
    orderBy?: 'title' | 'price' | 'createdAt' | 'rating';
    orderDirection?: 'asc' | 'desc';
}
