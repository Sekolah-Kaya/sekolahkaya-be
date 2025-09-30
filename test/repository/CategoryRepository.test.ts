import { PrismaClient } from "@prisma/client";
import { CategoryRepository } from "../../src/infrastructure/database/repository/CategoryRepository";
import { Category } from "../../src/domain/category/Category";

const prisma = new PrismaClient();
const categoryRepository = new CategoryRepository(prisma);

describe("CategoryRepository", () => {
  let category: Category;

  beforeAll(async () => {
    category = Category.create({
      name: "Test Category",
      description: "Test description",
      slug: "test-category",
    });
  });

  afterAll(async () => {
    await prisma.category.deleteMany({ where: { slug: category.slug } });
    await prisma.$disconnect();
  });

  it("should create a category", async () => {
    const createdCategory = await categoryRepository.create(category);
    expect(createdCategory).toBeDefined();
    expect(createdCategory.name).toBe("Test Category");
  });

  it("should find category by id", async () => {
    const foundCategory = await categoryRepository.findById(category.id);
    expect(foundCategory).not.toBeNull();
    expect(foundCategory?.id).toBe(category.id);
  });

  it("should find category by slug", async () => {
    const foundCategory = await categoryRepository.findBySlug(category.slug);
    expect(foundCategory).not.toBeNull();
    expect(foundCategory?.slug).toBe(category.slug);
  });

  it("should find all categories", async () => {
    const categories = await categoryRepository.findAll();
    expect(categories.length).toBeGreaterThan(0);
  });

  it("should update a category", async () => {
    const updatedCategory = await categoryRepository.update(category.id, {
      name: "Updated Category",
    });
    expect(updatedCategory).not.toBeNull();
    expect(updatedCategory?.name).toBe("Updated Category");
  });

  it("should delete a category", async () => {
    const result = await categoryRepository.delete(category.id);
    expect(result).toBe(true);
  });
});
