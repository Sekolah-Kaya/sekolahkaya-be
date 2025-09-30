export class Category {
    private constructor(
        private readonly _id: string,
        private _name: string,
        private _description: string | null,
        private readonly _slug: string,
        private readonly _createdAt: Date,
        private _updatedAt: Date
    ) {}

    public static create(data: {
        name: string;
        description?: string;
        slug: string;
    }): Category {
        const id = crypto.randomUUID();
        const now = new Date();

        if (!data.name.trim()) {
            throw new Error('Category name is required');
        }

        if (!data.slug.trim()) {
            throw new Error('Category slug is required');
        }

        if (!this.isValidSlug(data.slug)) {
            throw new Error('Invalid slug format');
        }

        return new Category(
            id,
            data.name.trim(),
            data.description?.trim() || null,
            data.slug.toLowerCase().trim(),
            now,
            now
        );
    }

    public static reconstitute(data: {
        id: string;
        name: string;
        description: string | null;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
    }): Category {
        return new Category(
            data.id,
            data.name,
            data.description,
            data.slug,
            data.createdAt,
            data.updatedAt
        );
    }

    private static isValidSlug(slug: string): boolean {
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
        return slugRegex.test(slug);
    }

    // Getters
    public get id(): string { return this._id; }
    public get name(): string { return this._name; }
    public get description(): string | null { return this._description; }
    public get slug(): string { return this._slug; }
    public get createdAt(): Date { return this._createdAt; }
    public get updatedAt(): Date { return this._updatedAt; }

    // Business methods
    public update(data: { name?: string; description?: string }): void {
        if (data.name && data.name.trim()) {
            this._name = data.name.trim();
        }
        if (data.description !== undefined) {
            this._description = data.description?.trim() || null;
        }
        this._updatedAt = new Date();
    }
}