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

/**
 * Удаляет все коды подтверждения для определенного email
 */
export async function deleteAllVerificationCodesForEmail(
  prisma: PrismaClient | Prisma.TransactionClient,
  email: string,
) {
  return prisma.verificationCode.deleteMany({ where: { email } });
}

/**
 * Создает код подтверждения
 */
export async function createVerificationCode(
  prisma: PrismaClient | Prisma.TransactionClient,
  email: string,
  code: string,
  type: "REGISTER" | "RESET_PASSWORD",
) {
  return prisma.verificationCode.create({
    data: { email, code, type, expires: new Date(Date.now() + 10 * 60 * 1000) },
  });
}
