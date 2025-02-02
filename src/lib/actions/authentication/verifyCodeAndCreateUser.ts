"use server";

import bcrypt from "bcryptjs";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import { signIn } from "@/auth";
import { getCookie } from "@/lib/helpers/cookie";
import {
  deleteRegistrationSession,
  getRegistrationSession,
} from "@/lib/repositories/registrationSession";
import { createUser } from "@/lib/repositories/user";
import {
  deleteVerificationCode,
  getVerificationCode,
} from "@/lib/repositories/verification";

import { prisma } from "../../../../prisma/prisma";

const OneTimeCodeSchema = z.object({
  code: z.string().length(6, { message: "Код должен быть длиной 6 символов." }),
});

type TVerifyCodeAndCreateUser = {
  status: {
    isAwaiting: boolean;
    isSuccess: boolean;
    isError: boolean;
  };
  redirectToSignUp?: boolean;
  errors?: Record<string, string[]>;
  error?: string;
};

export async function verifyCodeAndCreateUser(
  _prevState: unknown,
  formData: FormData,
): Promise<TVerifyCodeAndCreateUser> {
  console.log("⏳ Начало верификации кода и создания пользователя");

  try {
    // 1. Получаем и валидируем данные формы
    const fieldsData = {
      code: formData.get("code") as string,
    };
    console.log("📥 Полученные данные из формы:", fieldsData);

    const validated = OneTimeCodeSchema.safeParse(fieldsData);
    if (!validated.success) {
      console.error(
        "❌ Ошибка валидации кода:",
        validated.error.flatten().fieldErrors,
      );
      return {
        status: { isAwaiting: false, isError: true, isSuccess: false },
        errors: validated.error.flatten().fieldErrors,
      };
    }

    // 2. Получаем email из cookie
    const emailCookie = await getCookie("email");
    if (!emailCookie) {
      console.error("❌ Email не найден в cookie");
      return {
        status: { isAwaiting: false, isError: true, isSuccess: false },
        error: "Email не найден.",
      };
    }

    const { value: email } = emailCookie;
    const { code } = validated.data;
    console.log("📧 Верифицируем email:", email);

    // 3 Получаем сессию регистрации
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

    const { name, password } = registrationSession.data as {
      name: string;
      password: string;
    };

    console.log("✅ Найдена сессия регистрации:", registrationSession);

    // 4. Используем транзакцию Prisma для атомарных операций
    await prisma.$transaction(async (tx) => {
      // 4.1 Проверяем код подтверждения
      const verificationRecord = await getVerificationCode(tx, email, code);
      if (!verificationRecord) {
        throw new Error("Неверный код подтверждения.");
      }

      if (verificationRecord.expires < new Date()) {
        throw new Error("Срок действия кода истек.");
      }

      // 4.2 Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("🔑 Хешированный пароль создан");

      // 4.3 Создаем пользователя
      const user = await createUser(tx, email, name, hashedPassword);
      console.log("✅ Пользователь создан:", user);

      // 4.4 Удаляем запись кода подтверждения и сессию регистрации
      await deleteVerificationCode(tx, email, code);
      await deleteRegistrationSession(tx, email);

      return user;
    });

    // 5. Авторизуем пользователя
    await signIn("credentials", { email, password });

    return { status: { isSuccess: true, isError: false, isAwaiting: false } };
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
      error: errorMessage || "Произошла ошибка при создании пользователя.",
    };
  }
}
