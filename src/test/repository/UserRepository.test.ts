import { PrismaClient } from "@prisma/client";
import { Role } from "../../shared/types/Enum";
import { UserRepository } from "../../infrastructure/repository/UserRepository";
import { User } from "../../domain/models/User";

const prisma = new PrismaClient();
const userRepository = new UserRepository(prisma);

describe("UserRepository", () => {
  let user: User;

  beforeAll(() => {
    user = User.create({
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      phone: "1234567890",
      role: Role.STUDENT,
      passwordHash: "hashedpassword",
      profilePicture: "http://example.com/pic.jpg",
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: "test@example.com" } });
    await prisma.$disconnect();
  });

  it("should create a user", async () => {
    const createdUser = await userRepository.create(user);
    expect(createdUser).toBeDefined();
    expect(createdUser.email.getValue()).toBe("test@example.com");
  });

  it("should find user by id", async () => {
    const foundUser = await userRepository.findById(user.id);
    expect(foundUser).not.toBeNull();
    expect(foundUser?.id).toBe(user.id);
  });

  it("should find user by email", async () => {
    const foundUser = await userRepository.findByEmail("test@example.com");
    expect(foundUser).not.toBeNull();
    expect(foundUser?.email.getValue()).toBe("test@example.com");
  });

  it("should update a user", async () => {
    const updatedUser = await userRepository.update(user.id, {
      firstName: "Updated",
    });
    expect(updatedUser).not.toBeNull();
    expect(updatedUser?.firstName).toBe("Updated");
  });

  it("should delete a user", async () => {
    const result = await userRepository.delete(user.id);
    expect(result).toBe(true);
  });
});
