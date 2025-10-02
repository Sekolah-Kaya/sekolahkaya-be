import { PrismaClient } from "@prisma/client";
import { CourseLevel, Role, TransactionStatus } from "../../shared/types/Enum";
import { PaymentRepository } from "../../infrastructure/repository/PaymentRepository";
import { Payment } from "../../domain/models/Payment";
import { Enrollment } from "../../domain/models/Enrollment";
import { User } from "../../domain/models/User";
import { Course } from "../../domain/models/Course";
import { Category } from "../../domain/models/Category";

const prisma = new PrismaClient();
const paymentRepository = new PaymentRepository(prisma);

describe("PaymentRepository", () => {
  let payment: Payment;
  let enrollment: Enrollment;
  let user: User;
  let course: Course;
  let category: Category;
  let orderId: string;

  beforeAll(async () => {
    // Create test data in correct order
    user = User.create({
      email: "test3@example.com",
      firstName: "Test",
      lastName: "User",
      role: Role.STUDENT,
      passwordHash: "hashedpassword"
    });

    category = Category.create({
      name: "Test Category",
      slug: "test-category5"
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

    orderId = "test-order-id";
    payment = Payment.create({
      enrollmentId: enrollment.id,
      grossAmount: 100,
      orderId: orderId,
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

    await prisma.enrollment.create({
      data: {
        id: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        amountPaid: enrollment.amountPaid.getValue(),
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        progressPercentage: enrollment.progressPercentage
      }
    });
  });

  afterAll(async () => {
    await prisma.payment.deleteMany({ where: { orderId: orderId } });
    await prisma.enrollment.deleteMany({ where: { id: enrollment.id } });
    await prisma.course.deleteMany({ where: { id: course.id } });
    await prisma.category.deleteMany({ where: { id: category.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });
    await prisma.$disconnect();
  });

  it("should create a payment", async () => {
    const createdPayment = await paymentRepository.create(payment);
    expect(createdPayment).toBeDefined();
    expect(createdPayment.orderId).toBe(orderId);
  });

  it("should find payment by id", async () => {
    const foundPayment = await paymentRepository.findById(payment.id);
    expect(foundPayment).not.toBeNull();
    expect(foundPayment?.id).toBe(payment.id);
  });

  it("should find payment by order id", async () => {
    const foundPayment = await paymentRepository.findByOrderId(orderId);
    expect(foundPayment).not.toBeNull();
    expect(foundPayment?.orderId).toBe(orderId);
  });

  it("should find payment by enrollment id", async () => {
    const foundPayment = await paymentRepository.findByEnrollmentId(enrollment.id);
    expect(foundPayment).not.toBeNull();
    expect(foundPayment?.enrollmentId).toBe(enrollment.id);
  });

  it("should update a payment", async () => {
    const updatedPayment = await paymentRepository.update(payment.id, {
      transactionStatus: TransactionStatus.SETTLEMENT,
    });
    expect(updatedPayment).not.toBeNull();
    expect(updatedPayment?.transactionStatus).toBe(TransactionStatus.SETTLEMENT);
  });

  it("should delete a payment", async () => {
    const result = await paymentRepository.delete(payment.id);
    expect(result).toBe(true);
  });
});
