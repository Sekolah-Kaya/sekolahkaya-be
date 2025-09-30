import { PrismaClient } from "@prisma/client";
import { LessonRepository } from "../../src/infrastructure/database/repository/LessonRepository";
import { Lesson } from "../../src/domain/lesson/Lesson";
import { User } from "../../src/domain/user/User";
import { Course } from "../../src/domain/course/Course";
import { Category } from "../../src/domain/category/Category";
import { CourseLevel, Role } from "../../src/domain/common/enum";

const prisma = new PrismaClient();
const lessonRepository = new LessonRepository(prisma);

describe("LessonRepository", () => {
  let lesson: Lesson;
  let course: Course;
  let user: User;
  let category: Category;

  beforeAll(async () => {
    // Create test data in correct order
    user = User.create({
      email: "test4@example.com",
      firstName: "Test",
      lastName: "User",
      role: Role.INSTRUCTOR,
      passwordHash: "hashedpassword"
    });

    category = Category.create({
      name: "Test Category",
      slug: "test-category1"
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

    lesson = Lesson.create({
      title: "Test Lesson",
      content: "Test content",
      courseId: course.id,
      orderNumber: 1,
      durationMinutes: 60,
      videoUrl: "http://example.com/video.mp4",
    });

    // Save to database
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
  });

  afterAll(async () => {
    await prisma.lesson.deleteMany({ where: { title: "Test Lesson" } });
    await prisma.course.deleteMany({ where: { id: course.id } });
    await prisma.category.deleteMany({ where: { id: category.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });
    await prisma.$disconnect();
  });

  it("should create a lesson", async () => {
    const createdLesson = await lessonRepository.create(lesson);
    expect(createdLesson).toBeDefined();
    expect(createdLesson.title).toBe("Test Lesson");
  });

  it("should find lesson by id", async () => {
    const foundLesson = await lessonRepository.findById(lesson.id);
    expect(foundLesson).not.toBeNull();
    expect(foundLesson?.id).toBe(lesson.id);
  });

  it("should find lessons by course id", async () => {
    const lessons = await lessonRepository.findByCourseId(course.id);
    expect(lessons.length).toBeGreaterThan(0);
    expect(lessons[0].courseId).toBe(course.id);
  });

  it("should update a lesson", async () => {
    const updatedLesson = await lessonRepository.update(lesson.id, {
      title: "Updated Lesson",
    });
    expect(updatedLesson).not.toBeNull();
    expect(updatedLesson?.title).toBe("Updated Lesson");
  });

  it("should delete a lesson", async () => {
    const result = await lessonRepository.delete(lesson.id);
    expect(result).toBe(true);
  });
});
