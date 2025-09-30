import { DomainEvent, UserRegistered } from "../common/DomainEvent";
import { Role } from "../common/enum";
import { Email } from "../common/ValueObject";

export class User {
    private _domainEvents: DomainEvent[] = [];

    private constructor(
        private readonly _id: string,
        private readonly _email: Email,
        private _firstName: string,
        private _lastName: string,
        private _phone: string | null,
        private readonly _role: Role,
        private _profilePicture: string | null,
        private _isActive: boolean,
        private readonly _passwordHash: string,
        private readonly _createdAt: Date,
        private _updatedAt: Date
    ) {}

    public static create(data: {
        email: string;
        firstName: string;
        lastName: string;
        phone?: string;
        role: Role;
        passwordHash: string;
        profilePicture?: string;
    }): User {
        const id = crypto.randomUUID();
        const email = Email.create(data.email);
        const now = new Date();

        const user = new User(
            id,
            email,
            data.firstName.trim(),
            data.lastName.trim(),
            data.phone?.trim() || null,
            data.role,
            data.profilePicture || null,
            true,
            data.passwordHash,
            now,
            now
        );

        user.addDomainEvent(new UserRegistered(id, email.getValue(), data.role));
        return user;
    }

    public static reconstitute(data: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        role: Role;
        profilePicture: string | null;
        isActive: boolean;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
    }): User {
        return new User(
            data.id,
            Email.create(data.email),
            data.firstName,
            data.lastName,
            data.phone,
            data.role,
            data.profilePicture,
            data.isActive,
            data.passwordHash,
            data.createdAt,
            data.updatedAt
        );
    }

    // Getters
    public get id(): string { return this._id; }
    public get email(): Email { return this._email; }
    public get firstName(): string { return this._firstName; }
    public get lastName(): string { return this._lastName; }
    public get phone(): string | null { return this._phone; }
    public get role(): Role { return this._role; }
    public get profilePicture(): string | null { return this._profilePicture; }
    public get isActive(): boolean { return this._isActive; }
    public get passwordHash(): string { return this._passwordHash; }
    public get createdAt(): Date { return this._createdAt; }
    public get updatedAt(): Date { return this._updatedAt; }

    // Business methods
    public getFullName(): string {
        return `${this._firstName} ${this._lastName}`.trim();
    }

    public isInstructor(): boolean {
        return this._role === Role.INSTRUCTOR;
    }

    public isStudent(): boolean {
        return this._role === Role.STUDENT;
    }

    public isAdmin(): boolean {
        return this._role === Role.ADMIN;
    }

    public updateProfile(data: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        profilePicture?: string;
    }): void {
        if (data.firstName) this._firstName = data.firstName.trim();
        if (data.lastName) this._lastName = data.lastName.trim();
        if (data.phone !== undefined) this._phone = data.phone?.trim() || null;
        if (data.profilePicture !== undefined) this._profilePicture = data.profilePicture;
        this._updatedAt = new Date();
    }

    public deactivate(): void {
        this._isActive = false;
        this._updatedAt = new Date();
    }

    public activate(): void {
        this._isActive = true;
        this._updatedAt = new Date();
    }

    public canCreateCourse(): boolean {
        return this.isInstructor() && this._isActive;
    }

    // Domain events
    public getDomainEvents(): DomainEvent[] {
        return [...this._domainEvents];
    }

    public clearDomainEvents(): void {
        this._domainEvents = [];
    }

    private addDomainEvent(event: DomainEvent): void {
        this._domainEvents.push(event);
    }
}