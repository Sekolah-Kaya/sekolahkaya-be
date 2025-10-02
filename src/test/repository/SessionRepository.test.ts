import { PrismaClient } from "@prisma/client";
import { Role } from "../../shared/types/Enum";
import { SessionRepository } from "../../infrastructure/repository/SessionRepository";
import { Session } from "../../domain/models/Session";
import { User } from "../../domain/models/User";

const prisma = new PrismaClient();
const sessionRepository = new SessionRepository(prisma);

describe("SessionRepository", () => {
  let session: Session;
  let user: User;
  let jti: string;

  beforeAll(async () => {

    user = User.create({
      email: "test2@example.com",
      firstName: "Test",
      lastName: "User",
      role: Role.STUDENT,
      passwordHash: "hashedpassword"
    });

    jti = "test-jti";

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

    session = Session.create({
      userId: user.id,
      jti: jti,
      expiresAt: new Date(Date.now() + 3600 * 1000),
    });
  });

  afterAll(async () => {
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.session.deleteMany({ where: { id: user.id } })
    await prisma.$disconnect();
  });

  it("should create a session", async () => {
    const createdSession = await sessionRepository.create(session);
    expect(createdSession).toBeDefined();
    expect(createdSession.jti).toBe(jti);
  });

  it("should find session by id", async () => {
    const foundSession = await sessionRepository.findById(session.id);
    expect(foundSession).not.toBeNull();
    expect(foundSession?.id).toBe(session.id);
  });

  it("should find session by jti", async () => {
    const foundSession = await sessionRepository.findByJti(jti);
    expect(foundSession).not.toBeNull();
    expect(foundSession?.jti).toBe(jti);
  });

  it("should deactivate all sessions by user id", async () => {
    const result = await sessionRepository.deactivateAllSessionByUserId(user.id);
    expect(result).toBe(true);
  });

  it("should update a session", async () => {
    const updatedSession = await sessionRepository.update(session.id, {
      isActive: false,
    });
    expect(updatedSession).not.toBeNull();
    expect(updatedSession?.isActive).toBe(false);
  });

  it("should delete a session", async () => {
    const result = await sessionRepository.delete(session.id);
    expect(result).toBe(true);
  });

  it("should delete session by jti", async () => {
    const result = await sessionRepository.deleteByJti(jti);
    expect(result).toBe(true);
  });
});
