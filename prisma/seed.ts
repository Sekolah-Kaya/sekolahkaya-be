// seed.ts
import { prisma } from '../src/infrastructure/database/prisma'

async function main() {
  console.log('🌱 Starting seed...');

  // Hapus data existing (opsional, hati-hati di production!)
  await prisma.lessonProgress.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users
  console.log('👥 Creating users...');
  const users = await prisma.user.createMany({
    data: [
      {
        email: 'admin@example.com',
        passwordHash: '$2b$10$EXAMPLE_HASH_ADMIN', // Ganti dengan hash password sebenarnya
        firstName: 'Admin',
        lastName: 'User',
        phone: '+6281234567890',
        role: 'ADMIN',
        profilePicture: 'https://example.com/admin.jpg',
      },
      {
        email: 'instructor1@example.com',
        passwordHash: '$2b$10$EXAMPLE_HASH_INSTRUCTOR1',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+6281234567891',
        role: 'INSTRUCTOR',
        profilePicture: 'https://example.com/instructor1.jpg',
      },
      {
        email: 'instructor2@example.com',
        passwordHash: '$2b$10$EXAMPLE_HASH_INSTRUCTOR2',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+6281234567892',
        role: 'INSTRUCTOR',
      },
      {
        email: 'student1@example.com',
        passwordHash: '$2b$10$EXAMPLE_HASH_STUDENT1',
        firstName: 'Alice',
        lastName: 'Johnson',
        phone: '+6281234567893',
        role: 'STUDENT',
      },
      {
        email: 'student2@example.com',
        passwordHash: '$2b$10$EXAMPLE_HASH_STUDENT2',
        firstName: 'Bob',
        lastName: 'Williams',
        phone: '+6281234567894',
        role: 'STUDENT',
      },
    ],
  });

  const userRecords = await prisma.user.findMany();
  const admin = userRecords.find(u => u.role === 'ADMIN')!;
  const instructors = userRecords.filter(u => u.role === 'INSTRUCTOR');
  const students = userRecords.filter(u => u.role === 'STUDENT');

  // 2. Seed Categories
  console.log('📚 Creating categories...');
  const categories = await prisma.category.createMany({
    data: [
      {
        name: 'Web Development',
        description: 'Learn modern web development technologies',
        slug: 'web-development',
      },
      {
        name: 'Data Science',
        description: 'Master data analysis and machine learning',
        slug: 'data-science',
      },
      {
        name: 'Mobile Development',
        description: 'Build mobile apps for iOS and Android',
        slug: 'mobile-development',
      },
      {
        name: 'UI/UX Design',
        description: 'Design beautiful and user-friendly interfaces',
        slug: 'ui-ux-design',
      },
    ],
  });

  const categoryRecords = await prisma.category.findMany();

  // 3. Seed Courses
  console.log('🎓 Creating courses...');
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        instructorId: instructors[0].id,
        categoryId: categoryRecords[0].id,
        title: 'Complete React Developer Course',
        description: 'Learn React from scratch to advanced level',
        price: 299000,
        thumbnail: 'https://example.com/react-course.jpg',
        status: 'PUBLISHED',
        durationHours: 40,
        level: 'INTERMEDIATE',
      },
    }),
    prisma.course.create({
      data: {
        instructorId: instructors[0].id,
        categoryId: categoryRecords[1].id,
        title: 'Python for Data Science',
        description: 'Data analysis and visualization with Python',
        price: 249000,
        thumbnail: 'https://example.com/python-ds.jpg',
        status: 'PUBLISHED',
        durationHours: 35,
        level: 'BEGINNER',
      },
    }),
    prisma.course.create({
      data: {
        instructorId: instructors[1].id,
        categoryId: categoryRecords[2].id,
        title: 'Flutter Mobile Development',
        description: 'Build cross-platform mobile apps with Flutter',
        price: 349000,
        thumbnail: 'https://example.com/flutter-course.jpg',
        status: 'DRAFT',
        durationHours: 45,
        level: 'ADVANCED',
      },
    }),
  ]);

  // 4. Seed Lessons
  console.log('📖 Creating lessons...');
  const lessons = [];
  for (const course of courses) {
    const courseLessons = await Promise.all([
      prisma.lesson.create({
        data: {
          courseId: course.id,
          title: 'Introduction',
          description: 'Course introduction and overview',
          videoUrl: 'https://example.com/video1.mp4',
          content: 'Welcome to the course!',
          orderNumber: 1,
          durationMinutes: 30,
          isPreview: true,
        },
      }),
      prisma.lesson.create({
        data: {
          courseId: course.id,
          title: 'Setting Up Development Environment',
          description: 'Install and configure required tools',
          videoUrl: 'https://example.com/video2.mp4',
          content: 'Step-by-step setup guide',
          orderNumber: 2,
          durationMinutes: 45,
          isPreview: false,
        },
      }),
      prisma.lesson.create({
        data: {
          courseId: course.id,
          title: 'Core Concepts',
          description: 'Learn fundamental concepts',
          videoUrl: 'https://example.com/video3.mp4',
          content: 'Deep dive into core concepts',
          orderNumber: 3,
          durationMinutes: 60,
          isPreview: false,
        },
      }),
    ]);
    lessons.push(...courseLessons);
  }

  // 5. Seed Enrollments
  console.log('🎫 Creating enrollments...');
  const enrollments = [];
  for (const student of students) {
    for (const course of courses) {
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: student.id,
          courseId: course.id,
          amountPaid: course.price,
          status: 'ACTIVE',
          enrolledAt: new Date(),
          progressPercentage: Math.floor(Math.random() * 100),
        },
      });
      enrollments.push(enrollment);
    }
  }

  // 6. Seed Lesson Progress
  console.log('📊 Creating lesson progress...');
  for (const enrollment of enrollments) {
    const enrollmentLessons = lessons.filter(l => l.courseId === enrollment.courseId);

    for (const lesson of enrollmentLessons) {
      const status = Math.random() > 0.7 ? 'COMPLETED' :
        Math.random() > 0.5 ? 'IN_PROGRESS' : 'NOT_STARTED';

      await prisma.lessonProgress.create({
        data: {
          enrollmentId: enrollment.id,
          lessonId: lesson.id,
          status: status,
          watchDurationSeconds: status === 'COMPLETED' ? lesson.durationMinutes * 60 :
            status === 'IN_PROGRESS' ? Math.floor(lesson.durationMinutes * 30) : 0,
          startedAt: status !== 'NOT_STARTED' ? new Date() : null,
          completedAt: status === 'COMPLETED' ? new Date() : null,
        },
      });
    }
  }

  // 7. Seed Reviews
  console.log('⭐ Creating reviews...');
  await Promise.all([
    prisma.review.create({
      data: {
        userId: students[0].id,
        courseId: courses[0].id,
        rating: 5,
        comment: 'Excellent course! Very comprehensive.',
      },
    }),
    prisma.review.create({
      data: {
        userId: students[1].id,
        courseId: courses[0].id,
        rating: 4,
        comment: 'Good content, but could use more examples.',
      },
    }),
    prisma.review.create({
      data: {
        userId: students[0].id,
        courseId: courses[1].id,
        rating: 5,
        comment: 'Perfect for beginners!',
      },
    }),
  ]);

  // 8. Seed Payments
  console.log('💳 Creating payments...');
  for (const enrollment of enrollments) {
    await prisma.payment.create({
      data: {
        enrollmentId: enrollment.id,
        grossAmount: enrollment.amountPaid,
        orderId: `ORDER-${enrollment.id}`,
        transactionId: `TRX-${Date.now()}-${enrollment.id}`,
        transactionStatus: 'SETTLEMENT',
        paymentType: 'bank_transfer',
        fraudStatus: 'accept',
        snapToken: `SNAP-${enrollment.id}`,
        transactionTime: new Date(),
        settlementTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day later
      },
    });
  }

  // 9. Seed Sessions
  console.log('🔐 Creating sessions...');
  for (const user of userRecords) {
    await prisma.session.create({
      data: {
        userId: user.id,
        jti: `jti-${user.id}-${Date.now()}`,
        isActive: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '192.168.1.100',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log(`📊 Created: ${userRecords.length} users, ${categoryRecords.length} categories, ${courses.length} courses, ${lessons.length} lessons, ${enrollments.length} enrollments`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });