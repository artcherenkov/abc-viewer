import { Prisma, PrismaClient } from "@prisma/client";

/**
 * Создает нового пользователя
 */
export async function createUser(
  prisma: PrismaClient | Prisma.TransactionClient,
  email: string,
  name: string,
  password: string,
) {
  return prisma.user.create({
    data: {
      email,
      name,
      password,
      emailVerified: new Date(),
    },
  });
}
