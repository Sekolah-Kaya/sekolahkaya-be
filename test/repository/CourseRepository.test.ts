import { PrismaClient } from "@prisma/client";
import { CourseRepository } from "../../src/infrastructure/database/repository/CourseRepository";
import { Course } from "../../src/domain/course/Course";
import { CourseLevel, Role } from "../../src/domain/common/enum";
import { User } from "../../src/domain/user/User";
import { Category } from "../../src/domain/category/Category";

const prisma = new PrismaClient();
const courseRepository = new CourseRepository(prisma);

describe("CourseRepository", () => {
  let course: Course;
  let user: User;
  let category: Category;

  beforeAll(async () => {
    user = User.create({
      email: "test7@example.com",
      firstName: "Test",
      lastName: "User",
      role: Role.INSTRUCTOR,
      passwordHash: "hashedpassword"
    });

    category = Category.create({
      name: "Test Category",
      slug: "test-category2"
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
    })

    course = Course.create({
      instructorId: user.id,
      categoryId: category.id,
      title: "Test Course",
      description: "Test description",
      price: 100,
      durationHours: 10,
      level: CourseLevel.BEGINNER,
    });
  });

  afterAll(async () => {
    await prisma.course.deleteMany({ where: { title: "Test Course" } });
    await prisma.category.deleteMany({ where: { id: category.id } })
    await prisma.user.deleteMany({ where: { id: user.id } })
    await prisma.$disconnect();
  });

  it("should create a course", async () => {
    const createdCourse = await courseRepository.create(course);
    expect(createdCourse).toBeDefined();
    expect(createdCourse.title).toBe("Test Course");
  });

  it("should find course by id", async () => {
    const foundCourse = await courseRepository.findById(course.id);
    expect(foundCourse).not.toBeNull();
    expect(foundCourse?.id).toBe(course.id);
  });

  it("should find all courses", async () => {
    const courses = await courseRepository.findAll();
    expect(courses.length).toBeGreaterThanOrEqual(0);
  });

  it("should find courses by instructor id", async () => {
    const courses = await courseRepository.findByInstructorId(user.id);
    expect(courses.length).toBeGreaterThan(0);
    expect(courses[0].instructorId).toBe(user.id);
  });

  it("should search courses", async () => {
    const result = await courseRepository.searchCourses({ search: "Test" });
    expect(result.items.length).toBeGreaterThanOrEqual(0);
    expect(typeof result.total).toBe("number");
  });

  it("should get course lessons", async () => {
    const lessons = await courseRepository.getCourseLessons(course.id);
    expect(Array.isArray(lessons)).toBe(true);
  });

  it("should update a course", async () => {
    const updatedCourse = await courseRepository.update(course.id, {
      title: "Updated Course",
    });
    expect(updatedCourse).not.toBeNull();
    expect(updatedCourse?.title).toBe("Updated Course");
  });

  it("should delete a course", async () => {
    const result = await courseRepository.delete(course.id);
    expect(result).toBe(true);
  });
});
