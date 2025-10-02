import { PrismaClient } from "@prisma/client";
import { CourseLevel, Role } from "../../shared/types/Enum";
import { LessonProgressRepository } from "../../infrastructure/repository/LessonProgressRepository";
import { LessonProgress } from "../../domain/models/LessonProgress";
import { Enrollment } from "../../domain/models/Enrollment";
import { User } from "../../domain/models/User";
import { Course } from "../../domain/models/Course";
import { Category } from "../../domain/models/Category";
import { Lesson } from "../../domain/models/Lesson";

const prisma = new PrismaClient();
const lessonProgressRepository = new LessonProgressRepository(prisma);

describe("LessonProgressRepository", () => {
  let lessonProgress: LessonProgress;
  let enrollment: Enrollment;
  let user: User;
  let course: Course;
  let category: Category;
  let lesson: Lesson;

  beforeAll(async () => {
    user = User.create({
      email: "test5@example.com",
      firstName: "Test",
      lastName: "User",
      role: Role.STUDENT,
      passwordHash: "hashedpassword"
    });

    category = Category.create({
      name: "Test Categoryy",
      slug: "test-categoryy4"
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
      courseId: course.id,
      title: 'test',
      description: 'lorem ipsum',
      videoUrl: 'https://youtube.com',
      content: 'asd',
      orderNumber: 1,
      durationMinutes: 15,
      isPreview: false
    })

    enrollment = Enrollment.create({
      userId: user.id,
      courseId: course.id,
      amountPaid: 100,
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

    await prisma.lesson.create({
      data: {
        id: lesson.id,
        courseId: lesson.courseId,
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        content: lesson.content,
        orderNumber: lesson.orderNumber,
        durationMinutes: lesson.durationMinutes,
        isPreview: lesson.isPreview
      }
    })

    await prisma.enrollment.create({
      data: {
        id: enrollment.id,
        userId: user.id,
        courseId: course.id,
        amountPaid: enrollment.amountPaid.getValue(),
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        progressPercentage: enrollment.progressPercentage,
      }
    })

    lessonProgress = LessonProgress.create({
      enrollmentId: enrollment.id,
      lessonId: lesson.id,
    });
  });

  afterAll(async () => {
    await prisma.lessonProgress.deleteMany({ where: { enrollmentId: enrollment.id, lessonId: lesson.id } });
    await prisma.lesson.deleteMany({ where: { id: lesson.id } })
    await prisma.enrollment.deleteMany({ where: { id: enrollment.id } })
    await prisma.course.deleteMany({ where: { id: course.id } })
    await prisma.category.deleteMany({ where: { id: category.id } })
    await prisma.user.deleteMany({ where: { id: user.id } })
    await prisma.$disconnect();
  });

  it("should create a lesson progress", async () => {
    const createdProgress = await lessonProgressRepository.create(lessonProgress);
    expect(createdProgress).toBeDefined();
    expect(createdProgress.enrollmentId).toBe(enrollment.id);
  });

  it("should find lesson progress by id", async () => {
    const foundProgress = await lessonProgressRepository.findById(lessonProgress.id);
    expect(foundProgress).not.toBeNull();
    expect(foundProgress?.id).toBe(lessonProgress.id);
  });

  it("should find lesson progresses by enrollment id", async () => {
    const progresses = await lessonProgressRepository.findByEnrollmentId(enrollment.id);
    expect(progresses.length).toBeGreaterThan(0);
    expect(progresses[0].enrollmentId).toBe(enrollment.id);
  });

  it("should find lesson progress by enrollment and lesson", async () => {
    const foundProgress = await lessonProgressRepository.findByEnrollmentAndLesson(enrollment.id, lesson.id);
    expect(foundProgress).not.toBeNull();
    expect(foundProgress?.enrollmentId).toBe(enrollment.id);
    expect(foundProgress?.lessonId).toBe(lesson.id);
  });

  it("should find all lesson progresses", async () => {
    const progresses = await lessonProgressRepository.findAll();
    expect(progresses.length).toBeGreaterThanOrEqual(0);
  });

  it("should update a lesson progress", async () => {
    lessonProgress.markAsCompleted();
    const updatedProgress = await lessonProgressRepository.update(lessonProgress.id, lessonProgress);
    expect(updatedProgress).not.toBeNull();
    expect(updatedProgress?.status).toBe("COMPLETED");
  });

  it("should delete a lesson progress", async () => {
    const result = await lessonProgressRepository.delete(lessonProgress.id);
    expect(result).toBe(true);
  });
});
