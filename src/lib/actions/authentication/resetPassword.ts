"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { getCookie, setHttpOnlyCookie } from "@/lib/helpers/cookie";
import { generateVerificationCode } from "@/lib/helpers/generateVerificationCode";
import { sendEmail } from "@/lib/helpers/sendVerificationEmail";

import { prisma } from "../../../../prisma/prisma";

// Типы ответов
type TSendResetCodeResponse = {
  status: {
    isAwaiting: boolean;
    isSuccess: boolean;
    isError: boolean;
  };
  fieldsData: { email: string };
  errors?: Record<string, string[]>;
  errorMessage?: string;
};

type TVerifyResetCodeResponse = {
  status: { isAwaiting: boolean; isSuccess: boolean; isError: boolean };
  fieldsData: { code: string };
  errorMessage?: string;
};

type TResetPasswordResponse = {
  status: { isAwaiting: boolean; isSuccess: boolean; isError: boolean };
  errorMessage?: string;
};

/*
  Action 1. sendResetCode
  Пользователь вводит email для сброса пароля.
  Если пользователь найден, генерируется шестизначный код, создаются записи:
    - VerificationCode (тип RESET_PASSWORD) с хэшированным кодом и сроком действия,
    - PasswordResetSession для отслеживания состояния (isVerified по умолчанию false).
  Затем код отправляется на email, а в httpOnly cookie сохраняется email (в открытом виде, так как cookie защищён).
*/
export async function sendResetCode(
  _prevState: unknown,
  formData: FormData,
): Promise<TSendResetCodeResponse> {
  try {
    console.log("⏳ Начало отправки кода сброса пароля");

    const email = formData.get("email") as string;
    if (!email) {
      return {
        status: {
          isAwaiting: false,
          isSuccess: false,
          isError: true,
        },
        fieldsData: { email: "" },
        errorMessage: "Email обязателен.",
      };
    }

    // Проверяем, существует ли пользователь с данным email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        status: {
          isAwaiting: false,
          isSuccess: false,
          isError: true,
        },
        fieldsData: { email },
        errorMessage: "Пользователь с таким email не найден.",
      };
    }

    // Генерируем шестизначный код
    const code = generateVerificationCode(); // например, "123456"
    console.log(`✅ Сгенерирован код сброса: ${code}`);

    // Хэшируем код с использованием SHA256
    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

    // Удаляем предыдущие записи для сброса пароля по данному email
    await prisma.verificationCode.deleteMany({
      where: { email, type: "RESET_PASSWORD" },
    });

    // Создаем новую запись в VerificationCode
    await prisma.verificationCode.create({
      data: {
        email,
        code: hashedCode,
        type: "RESET_PASSWORD",
        expires: new Date(Date.now() + 10 * 60 * 1000), // код действует 10 минут
      },
    });

    // Создаем или обновляем сессию сброса пароля (PasswordResetSession)
    await prisma.passwordResetSession.upsert({
      where: { email },
      update: {
        isVerified: false,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
      create: {
        email,
        isVerified: false,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        userId: user.id,
      },
    });

    // Устанавливаем HttpOnly cookie с email (без хэширования, так как cookie недоступен клиентскому JS)
    await setHttpOnlyCookie({ name: "resetEmail", value: email });
    console.log("✅ Установлен HttpOnly cookie с email");

    // Отправляем email с кодом сброса пароля
    await sendEmail({
      to: email,
      subject: "Код сброса пароля",
      html: `Ваш код для сброса пароля: <strong>${code}</strong>`,
    });

    console.log("✅ Код успешно отправлен!");

    return {
      status: {
        isAwaiting: false,
        isSuccess: true,
        isError: false,
      },
      fieldsData: { email },
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("❌ Ошибка при отправке кода сброса пароля:", error);
    return {
      status: {
        isAwaiting: false,
        isSuccess: false,
        isError: true,
      },
      fieldsData: { email: (formData.get("email") as string) || "" },
      errorMessage:
        "Произошла ошибка при отправке кода сброса. Попробуйте снова.",
    };
  }
}

/*
  Action 2. verifyResetCode
  На этом шаге email извлекается из httpOnly cookie "resetEmail".
  Пользователь вводит полученный код сброса.
  Сервер ищет соответствующую запись в VerificationCode, сравнивает хэш кода,
  и при успешной проверке обновляет PasswordResetSession – устанавливая isVerified = true.
*/
export async function verifyResetCode(
  _prevState: unknown,
  formData: FormData,
): Promise<TVerifyResetCodeResponse> {
  try {
    console.log("⏳ Начало проверки кода сброса пароля");

    // Извлекаем email из HttpOnly cookie
    const emailCookie = await getCookie("resetEmail");
    if (!emailCookie) {
      return {
        status: { isAwaiting: false, isSuccess: false, isError: true },
        fieldsData: { code: (formData.get("code") as string) || "" },
        errorMessage: "Сессия не найдена. Попробуйте заново отправить код.",
      };
    }
    const email = emailCookie.value;

    console.log("Ищу код для ", email);

    const codeInput = formData.get("code") as string;
    if (!codeInput) {
      return {
        status: { isAwaiting: false, isSuccess: false, isError: true },
        fieldsData: { code: "" },
        errorMessage: "Код обязателен.",
      };
    }

    // Поиск записи VerificationCode для данного email и типа RESET_PASSWORD
    const record = await prisma.verificationCode.findFirst({
      where: { email, type: "RESET_PASSWORD" },
    });

    if (!record || new Date() > record.expires) {
      return {
        status: { isAwaiting: false, isSuccess: false, isError: true },
        fieldsData: { code: codeInput },
        errorMessage: "Код не найден или просрочен.",
      };
    }

    // Хэшируем введенный код и сравниваем с сохраненным хэшом
    const hashedInput = crypto
      .createHash("sha256")
      .update(codeInput)
      .digest("hex");
    if (hashedInput !== record.code) {
      return {
        status: { isAwaiting: false, isSuccess: false, isError: true },
        fieldsData: { code: codeInput },
        errorMessage: "Неверный код.",
      };
    }

    // Обновляем PasswordResetSession: устанавливаем флаг isVerified = true
    await prisma.passwordResetSession.update({
      where: { email },
      data: { isVerified: true },
    });

    // Удаляем запись VerificationCode, так как она использована
    await prisma.verificationCode.delete({
      where: { id: record.id },
    });

    console.log("✅ Код успешно подтвержден!");
    return {
      status: { isAwaiting: false, isSuccess: true, isError: false },
      fieldsData: { code: codeInput },
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("❌ Ошибка при проверке кода сброса пароля:", error);
    return {
      status: { isAwaiting: false, isSuccess: false, isError: true },
      fieldsData: { code: (formData.get("code") as string) || "" },
      errorMessage: "Произошла ошибка при проверке кода. Попробуйте снова.",
    };
  }
}

/*
  Action 3. resetPassword
  Если для email (из HttpOnly cookie) существует сессия сброса с isVerified = true и не истекла,
  пользователь может задать новый пароль. Новый пароль валидируется, хэшируется (bcrypt) и сохраняется.
  После успешного обновления сессия сброса удаляется.
*/
export async function resetPassword(
  _prevState: unknown,
  formData: FormData,
): Promise<TResetPasswordResponse> {
  try {
    console.log("⏳ Начало сброса пароля");

    // Извлекаем email из HttpOnly cookie
    const emailCookie = await getCookie("resetEmail");
    if (!emailCookie) {
      return {
        status: { isAwaiting: false, isSuccess: false, isError: true },
        errorMessage: "Сессия не найдена. Попробуйте заново отправить код.",
      };
    }
    const email = emailCookie.value;

    const newPassword = formData.get("newPassword") as string;
    if (!newPassword) {
      return {
        status: { isAwaiting: false, isSuccess: false, isError: true },
        errorMessage: "Новый пароль обязателен.",
      };
    }

    // Проверяем, что для данного email существует сессия сброса с подтвержденным кодом
    const resetSession = await prisma.passwordResetSession.findUnique({
      where: { email },
    });
    if (
      !resetSession ||
      !resetSession.isVerified ||
      new Date() > resetSession.expiresAt
    ) {
      return {
        status: { isAwaiting: false, isSuccess: false, isError: true },
        errorMessage: "Сессия сброса пароля недействительна или истекла.",
      };
    }

    // Простейшая валидация нового пароля (например, минимум 8 символов)
    if (newPassword.length < 8) {
      return {
        status: { isAwaiting: false, isSuccess: false, isError: true },
        errorMessage: "Пароль должен содержать не менее 8 символов.",
      };
    }

    // Хэшируем новый пароль с помощью bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль пользователя
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Удаляем сессию сброса пароля, так как она больше не нужна
    await prisma.passwordResetSession.delete({ where: { email } });

    console.log("✅ Пароль успешно сброшен!");
    return {
      status: { isAwaiting: false, isSuccess: true, isError: false },
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("❌ Ошибка при сбросе пароля:", error);
    return {
      status: { isAwaiting: false, isSuccess: false, isError: true },
      errorMessage: "Произошла ошибка при сбросе пароля. Попробуйте снова.",
    };
  }
}
