"use server";

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
  const fieldsData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // Провалидировать данные из формы
  const validated = SignUpFormSchema.safeParse(fieldsData);

  // Отобразить ошибки валидации
  if (!validated.success) {
    return {
      status: {
        isAwaiting: false,
        isSuccess: false,
        isError: true,
        hasCodeSent: false,
      },
      fieldsData,
      errors: validated.error.flatten().fieldErrors,
      errorMessage: "Ошибка валидации полей",
    };
  }

  const { email } = validated.data;

  // Проверяем, существует ли уже пользователь с таким email
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
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

  await createRegistrationSession(email, fieldsData);
  await setHttpOnlyCookie({ name: "email", value: email });

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
    status: {
      isAwaiting: false,
      isSuccess: true,
      isError: false,
      hasCodeSent: true,
    },
    fieldsData,
  };
}
