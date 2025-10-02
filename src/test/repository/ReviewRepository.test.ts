import { PrismaClient } from "@prisma/client";
import { CourseLevel, Role } from "../../shared/types/Enum";
import { ReviewRepository } from "../../infrastructure/repository/ReviewRepository";
import { Review } from "../../domain/models/Review";
import { Category } from "../../domain/models/Category";
import { Course } from "../../domain/models/Course";
import { User } from "../../domain/models/User";

const prisma = new PrismaClient();
const reviewRepository = new ReviewRepository(prisma);

describe("ReviewRepository", () => {
  let review: Review;
  let category: Category;
  let course: Course;
  let user: User;

  beforeAll(async () => {
    user = User.create({
      email: "test1@example.com",
      firstName: "Test",
      lastName: "User",
      role: Role.STUDENT,
      passwordHash: "hashedpassword"
    });

    category = Category.create({
      name: "Test Category",
      slug: "test-category7"
    });
    
    course = Course.create({
      instructorId: user.id,
      categoryId: category.id,
      title: "Test Course",
      description: "Test description",
      price: 100,
      durationHours: 10,
      level: CourseLevel.BEGINNER,
    });

    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email.getValue(),
        passwordHash: user.passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

    await prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    });

    await prisma.course.create({
      data: {
        id: course.id,
        instructorId: course.instructorId,
        categoryId: course.categoryId,
        title: course.title,
        description: course.description,
        price: course.price.getValue(),
        status: course.status,
        durationHours: course.durationHours,
        level: course.level,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
      }
    });

    review = Review.create({
      courseId: course.id,
      userId: user.id,
      rating: 5,
      comment: "Great course!",
    });
  });

  afterAll(async () => {
    await prisma.review.deleteMany({ where: { courseId: course.id, userId: user.id } });
    await prisma.course.deleteMany({ where: { id: course.id } });
    await prisma.category.deleteMany({ where: { id: category.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });
    await prisma.$disconnect();
  });

  it("should create a review", async () => {
    const createdReview = await reviewRepository.create(review);
    expect(createdReview).toBeDefined();
  });

  it("should find review by id", async () => {
    const foundReview = await reviewRepository.findById(review.id);
    expect(foundReview).not.toBeNull();
    expect(foundReview?.id).toBe(review.id);
  });

  it("should find reviews by course id", async () => {
    const reviews = await reviewRepository.findAllWithFilter(course.id);
    expect(reviews.length).toBeGreaterThan(0);
    expect(reviews[0].courseId).toBe(course.id);
  });

  it("should update a review", async () => {
    const updatedReview = await reviewRepository.update(review.id, review);
    expect(updatedReview).not.toBeNull();
  });

  it("should delete a review", async () => {
    const result = await reviewRepository.delete(review.id);
    expect(result).toBe(true);
  });
});
