export type CreateCategoryDTO = {
    name: string
    description: string
    slug: string
}

export type UpdateCategoryDTO = {
    name?: string
    description?: string
    slug?: string
}