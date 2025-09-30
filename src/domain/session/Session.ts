export class Session {
    private constructor(
        private readonly _id: string,
        private readonly _userId: string,
        private readonly _jti: string,
        private _isActive: boolean,
        private readonly _userAgent: string | null,
        private readonly _ipAddress: string | null,
        private readonly _expiresAt: Date,
        private readonly _createdAt: Date,
        private _updatedAt: Date
    ) {}

    public static create(data: {
        userId: string;
        jti: string;
        userAgent?: string;
        ipAddress?: string;
        expiresAt: Date;
    }): Session {
        const id = crypto.randomUUID();
        const now = new Date();

        if (!data.jti.trim()) {
            throw new Error('JWT ID is required');
        }

        if (data.expiresAt <= now) {
            throw new Error('Expiration date must be in the future');
        }

        return new Session(
            id,
            data.userId,
            data.jti.trim(),
            true,
            data.userAgent || null,
            data.ipAddress || null,
            data.expiresAt,
            now,
            now
        );
    }

    public static reconstitute(data: {
        id: string;
        userId: string;
        jti: string;
        isActive: boolean;
        userAgent: string | null;
        ipAddress: string | null;
        expiresAt: Date;
        createdAt: Date;
        updatedAt: Date;
    }): Session {
        return new Session(
            data.id,
            data.userId,
            data.jti,
            data.isActive,
            data.userAgent,
            data.ipAddress,
            data.expiresAt,
            data.createdAt,
            data.updatedAt
        );
    }

    // Getters
    public get id(): string { return this._id; }
    public get userId(): string { return this._userId; }
    public get jti(): string { return this._jti; }
    public get isActive(): boolean { return this._isActive; }
    public get userAgent(): string | null { return this._userAgent; }
    public get ipAddress(): string | null { return this._ipAddress; }
    public get expiresAt(): Date { return this._expiresAt; }
    public get createdAt(): Date { return this._createdAt; }
    public get updatedAt(): Date { return this._updatedAt; }

    // Business methods
    public isExpired(): boolean {
        return new Date() > this._expiresAt;
    }

    public isValid(): boolean {
        return this._isActive && !this.isExpired();
    }

    public matchesRequest(userAgent?: string, ipAddress?: string): boolean {
        // Basic security check - can be enhanced based on requirements
        if (this._userAgent && userAgent && this._userAgent !== userAgent) {
            return false;
        }
        
        if (this._ipAddress && ipAddress && this._ipAddress !== ipAddress) {
            return false;
        }
        
        return true;
    }

    public revoke(): void {
        this._isActive = false;
        this._updatedAt = new Date();
    }

    public reactivate(): void {
        if (this.isExpired()) {
            throw new Error('Cannot reactivate expired session');
        }
        
        this._isActive = true;
        this._updatedAt = new Date();
    }
}