import { Prisma, PrismaClient } from "@prisma/client";

export async function getFiles(
  prisma: PrismaClient | Prisma.TransactionClient,
  userId: string,
) {
  return prisma.file.findMany({
    where: { userId },
  });
}
