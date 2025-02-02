import { Prisma, PrismaClient } from "@prisma/client";

/**
 * Получает код подтверждения по email и коду
 */
export async function getVerificationCode(
  prisma: PrismaClient | Prisma.TransactionClient,
  email: string,
  code: string,
) {
  return prisma.verificationCode.findUnique({
    where: { email_code: { email, code } },
  });
}

/**
 * Удаляет код подтверждения по email и коду
 */
export async function deleteVerificationCode(
  prisma: PrismaClient | Prisma.TransactionClient,
  email: string,
  code: string,
) {
  return prisma.verificationCode.delete({
    where: { email_code: { email, code } },
  });
}
