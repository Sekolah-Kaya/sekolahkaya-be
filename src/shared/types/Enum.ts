export enum Role {
    STUDENT = 'STUDENT',
    INSTRUCTOR = 'INSTRUCTOR',
    ADMIN = 'ADMIN'
}

export enum CourseStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED'
}

export enum CourseLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED'
}

export enum EnrollmentStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum ProgressStatus {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED'
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    SETTLEMENT = 'SETTLEMENT',
    CANCEL = 'CANCEL',
    DENY = 'DENY',
    EXPIRE = 'EXPIRE',
    FAILURE = 'FAILURE'
}