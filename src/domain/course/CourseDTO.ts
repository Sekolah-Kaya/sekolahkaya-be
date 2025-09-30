import { CourseLevel, CourseStatus } from "../common/enum";

export interface CreateCourseCommand {
    instructorId: string;
    categoryId: string;
    title: string;
    description?: string;
    price: number;
    thumbnail?: string;
    durationHours: number;
    level: CourseLevel;
}

export interface UpdateCourseCommand {
    courseId: string;
    instructorId: string; // For authorization
    title?: string;
    description?: string;
    thumbnail?: string;
    durationHours?: number;
}

export interface PublishCourseCommand {
    courseId: string;
    instructorId: string;
}

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
