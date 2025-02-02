"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";

import { SignUpFormSchema } from "@/lib/descriptions/signUpFormSchema";
import { setHttpOnlyCookie } from "@/lib/helpers/cookie";
import { generateVerificationCode } from "@/lib/helpers/generateVerificationCode";
import { createRegistrationSession } from "@/lib/helpers/registrationSession";
import { sendEmail } from "@/lib/helpers/sendVerificationEmail";

import { prisma } from "../../../../prisma/prisma";

type TSendVerificationCodeStatus = Record<
  "isAwaiting" | "isSuccess" | "isError" | "hasCodeSent",
  boolean
>;

type TSendVerificationCode = {
  status: TSendVerificationCodeStatus;
  fieldsData: { name: string; email: string; password: string };
  errors?: Record<string, string[]>;
  errorMessage?: string;
};

export async function sendVerificationCode(
  _prevState: unknown,
  formData: FormData,
): Promise<TSendVerificationCode> {
  try {
    console.log("⏳ Начало отправки кода верификации");

    // 1. Валидация данных формы
    const fieldsData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validated = SignUpFormSchema.safeParse(fieldsData);
    if (!validated.success) {
      console.error(
        "❌ Ошибка валидации полей",
        validated.error.flatten().fieldErrors,
      );
      return {
        status: {
          isAwaiting: false,
          isSuccess: false,
          isError: true,
          hasCodeSent: false,
        },
        fieldsData,
        errors: validated.error.flatten().fieldErrors,
        errorMessage: "Ошибка валидации полей.",
      };
    }

    const { email } = validated.data;
    console.log(`📧 Проверяем наличие пользователя с email: ${email}`);

    // 2. Проверяем, существует ли уже пользователь с таким email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.error("❌ Пользователь уже существует");
      return {
        status: {
          isAwaiting: false,
          isSuccess: false,
          isError: true,
          hasCodeSent: false,
        },
        fieldsData,
        errorMessage: "Пользователь с таким email уже существует.",
      };
    }

    // 3. Генерируем код подтверждения
    const code = generateVerificationCode();
    console.log(`✅ Сгенерирован код подтверждения: ${code}`);

    // 4. Создаем регистрационную сессию и сохраняем код в БД в транзакции
    await prisma.$transaction(async (tx) => {
      console.log("🔄 Начинаем транзакцию");

      // 4.1 Создаем сессию регистрации
      await createRegistrationSession(email, fieldsData);
      console.log("✅ Регистрационная сессия создана");

      // 4.2 Устанавливаем HttpOnly cookie
      await setHttpOnlyCookie({ name: "email", value: email });
      console.log("✅ Установлен HttpOnly cookie");

      // 4.3 Удаляем предыдущие коды для данного email
      await tx.verificationCode.deleteMany({
        where: { email, type: "REGISTER" },
      });

      // 4.4 Сохраняем новый код верификации
      await tx.verificationCode.create({
        data: {
          email,
          code,
          type: "REGISTER",
          expires: new Date(Date.now() + 10 * 60 * 1000), // Код действует 10 минут
        },
      });

      console.log("✅ Код подтверждения сохранен в БД");
    });

    // 5. Отправляем email с кодом подтверждения
    console.log("📧 Отправляем код на email:", email);
    await sendEmail({
      to: email,
      subject: "Код подтверждения регистрации",
      html: `Ваш код подтверждения: ${code}`,
    });

    console.log("✅ Код успешно отправлен!");

    return {
      status: {
        isAwaiting: false,
        isSuccess: true,
        isError: false,
        hasCodeSent: true,
      },
      fieldsData,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    console.error("❌ Ошибка при отправке кода:", error);

    return {
      status: {
        isAwaiting: false,
        isSuccess: false,
        isError: true,
        hasCodeSent: false,
      },
      fieldsData: {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      },
      errorMessage: "Произошла ошибка при отправке кода. Попробуйте снова.",
    };
  }
}
