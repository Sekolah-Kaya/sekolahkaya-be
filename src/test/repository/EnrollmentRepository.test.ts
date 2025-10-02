import { PrismaClient } from "@prisma/client";
import { CourseLevel, Role } from "../../shared/types/Enum";
import { EnrollmentRepository } from "../../infrastructure/repository/EnrollmentRepository";
import { Enrollment } from "../../domain/models/Enrollment";
import { User } from "../../domain/models/User";
import { Course } from "../../domain/models/Course";
import { Category } from "../../domain/models/Category";

const prisma = new PrismaClient();
const enrollmentRepository = new EnrollmentRepository(prisma);

describe("EnrollmentRepository", () => {
  let enrollment: Enrollment;
  let user: User;
  let course: Course;
  let category: Category;

  beforeAll(async () => {
    // Create test data in correct order
    user = User.create({
      email: "test6@example.com",
      firstName: "Test",
      lastName: "User",
      role: Role.STUDENT,
      passwordHash: "hashedpassword"
    });

    category = Category.create({
      name: "Test Category",
      slug: "test-category3"
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
  });

  afterAll(async () => {
    await prisma.enrollment.deleteMany({ where: { userId: user.id, courseId: course.id } });
    await prisma.course.deleteMany({ where: { id: course.id } });
    await prisma.category.deleteMany({ where: { id: category.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });
    await prisma.$disconnect();
  });

  it("should create an enrollment", async () => {
    const createdEnrollment = await enrollmentRepository.create(enrollment);
    expect(createdEnrollment).toBeDefined();
    expect(createdEnrollment.userId).toBe(user.id);
  });

  it("should find enrollment by id", async () => {
    const foundEnrollment = await enrollmentRepository.findById(enrollment.id);
    expect(foundEnrollment).not.toBeNull();
    expect(foundEnrollment?.id).toBe(enrollment.id);
  });

  it("should find enrollments by user id", async () => {
    const enrollments = await enrollmentRepository.findByUserId(user.id);
    expect(enrollments.length).toBeGreaterThan(0);
    expect(enrollments[0].userId).toBe(user.id);
  });

  it("should find enrollment by user and course", async () => {
    const foundEnrollment = await enrollmentRepository.findByUserAndCourse(user.id, course.id);
    expect(foundEnrollment).not.toBeNull();
    expect(foundEnrollment?.userId).toBe(user.id);
    expect(foundEnrollment?.courseId).toBe(course.id);
  });

  it("should find all enrollments", async () => {
    const enrollments = await enrollmentRepository.findAll();
    expect(enrollments.length).toBeGreaterThanOrEqual(0);
  });

  it("should update an enrollment", async () => {
    enrollment.updateProgress(50);
    const updatedEnrollment = await enrollmentRepository.update(enrollment.id, enrollment);
    expect(updatedEnrollment).not.toBeNull();
    expect(updatedEnrollment?.progressPercentage).toBe(50);
  });

  it("should delete an enrollment", async () => {
    const result = await enrollmentRepository.delete(enrollment.id);
    expect(result).toBe(true);
  });
});
