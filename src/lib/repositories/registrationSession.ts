import { Prisma, PrismaClient } from "@prisma/client";

/**
 * Получает сессию регистрации по email
 */
export async function getRegistrationSession(
  prisma: PrismaClient | Prisma.TransactionClient,
  email: string,
) {
  return prisma.registrationSession.findUnique({
    where: { email },
  });
}

/**
 * Удаляет сессию регистрации по email
 */
export async function deleteRegistrationSession(
  prisma: PrismaClient | Prisma.TransactionClient,
  email: string,
) {
  return prisma.registrationSession.delete({
    where: { email },
  });
}
