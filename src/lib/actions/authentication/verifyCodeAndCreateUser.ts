// src/lib/actions/authentication/verifyCodeAndCreateUser.ts
"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { signIn } from "@/auth";
import { USER_CREATION_ERROR } from "@/lib/constants/errors";
import { SignUpFormSchema } from "@/lib/descriptions/signUpFormSchema";

import { prisma } from "../../../../prisma/prisma";

const CodeSchema = z
  .string()
  .length(6, { message: "Код должен быть длиной 6 символов." });

export async function verifyCodeAndCreateUser(formData: FormData) {
  const fieldsData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const code = formData.get("code") as string;

  const validatedCredentials = SignUpFormSchema.safeParse(fieldsData);
  const validatedCode = CodeSchema.safeParse(code);

  if (!validatedCredentials.success) {
    return {
      success: false,
      fieldsData,
      errors: validatedCredentials.error.flatten().fieldErrors,
    };
  }

  if (!validatedCode.success) {
    return {
      success: false,
      fieldsData,
      errors: { code: [validatedCode.error.message] },
    };
  }

  const { name, email, password } = validatedCredentials.data;

  // Ищем запись с кодом подтверждения
  const verificationRecord = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token: code } },
  });

  if (!verificationRecord) {
    return { error: "Неверный код подтверждения." };
  }

  if (verificationRecord.expires < new Date()) {
    return { error: "Срок действия кода истек." };
  }

  // Хешируем пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  // Создаем пользователя
  const user = await prisma.user.create({
    data: {
      email,
      name: name,
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  if (!user) {
    return { success: false, fieldsData, errorMessage: USER_CREATION_ERROR };
  }

  // Удаляем запись кода подтверждения
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: email, token: code } },
  });

  // Авторизуем пользователя
  await signIn("credentials", { email, password });

  return { success: true };
}
