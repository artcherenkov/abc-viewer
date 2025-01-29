"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";

import { prisma } from "../../../../prisma/prisma";

const promisifiedTimeot = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function verifyEmail({
  token,
  email,
}: {
  token?: string;
  email?: string;
}) {
  await promisifiedTimeot(2000);

  try {
    if (!token || !email) {
      throw new Error("Некорректный URL");
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { identifier_token: { token, identifier: email } },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      throw new Error("Неверный или истекший токен");
    }

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({
      where: { identifier_token: { token, identifier: email } },
    });

    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    if (error instanceof Error) {
      switch (error.message) {
        case "Некорректный URL":
          return { success: false, error: "Некорректный URL" };
        case "Неверный или истекший токен":
          return { success: false, error: "Неверный или истекший токен" };
        default:
          return { success: false, error: "Неизвестная ошибка" };
      }
    }

    return { success: false, error: "Неизвестная ошибка" };
  }
}
