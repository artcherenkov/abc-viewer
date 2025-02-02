"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";

import { getCookie } from "@/lib/helpers/cookie";
import { generateVerificationCode } from "@/lib/helpers/generateVerificationCode";
import { sendEmail } from "@/lib/helpers/sendVerificationEmail";
import {
  deleteRegistrationSession,
  getRegistrationSession,
} from "@/lib/repositories/registrationSession";

import { prisma } from "../../../../prisma/prisma";

type TResendCode = {
  status: {
    isAwaiting: boolean;
    isSuccess: boolean;
    isError: boolean;
  };
  redirectToSignUp?: boolean;
  errors?: Record<string, string[]>;
  error?: string;
  errorCode?: string;
};

export async function resendVerificationCode(): Promise<TResendCode> {
  try {
    const emailCookie = await getCookie("email");

    if (!emailCookie) {
      throw new Error("Email не найден в cookie");
    }

    const { value: email } = emailCookie;

    const registrationSession = await getRegistrationSession(prisma, email);
    if (!registrationSession) {
      throw new Error("Сессия регистрации не найдена.", {
        cause: "redirect to sign up",
      });
    }

    if (new Date() > new Date(registrationSession.expiresAt)) {
      await deleteRegistrationSession(prisma, email);
      throw new Error("Сессия регистрации истекла.", {
        cause: "redirect to sign up",
      });
    }

    console.log("✅ Найдена сессия регистрации:", registrationSession);

    // Генерируем код подтверждения
    const code = generateVerificationCode();

    await prisma.verificationCode.deleteMany({
      where: { email, type: "REGISTER" },
    });

    // Сохраняем код и данные пользователя в базе данных
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        type: "REGISTER",
        expires: new Date(Date.now() + 10 * 60 * 1000), // Код действует 10 минут
      },
    });

    // Отправляем код на email
    await sendEmail({
      to: email,
      subject: "Код подтверждения регистрации",
      html: `Ваш код подтверждения: ${code}`,
    });

    return {
      status: { isAwaiting: false, isSuccess: true, isError: false },
    };
  } catch (error) {
    const isErrorInstance = error instanceof Error;

    if (isRedirectError(error)) throw error;

    const errorMessage = isErrorInstance
      ? error.message
      : "Произошла неизвестная ошибка.";

    const redirectToSignUp = isErrorInstance
      ? error.cause === "redirect to sign up"
      : false;

    return {
      status: { isAwaiting: false, isError: true, isSuccess: false },
      redirectToSignUp,
      error: errorMessage || "Произошла ошибка при отправке кода.",
    };
  }
}
