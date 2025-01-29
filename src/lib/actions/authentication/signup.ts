"use server";

import bcrypt from "bcryptjs";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { signIn } from "@/auth";
import {
  UNKNOWN_ERROR,
  USER_ALREADY_EXISTS_ERROR,
  USER_CREATION_ERROR,
} from "@/lib/constants/errors";
import { SignUpFormSchema } from "@/lib/descriptions/signUpFormSchema";
import { isUserAlreadyExistsError } from "@/lib/helpers/errors";

import { prisma } from "../../../../prisma/prisma";

export async function signup(_prevState: unknown, formData: FormData) {
  const fieldsData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // Провалидировать данные из формы
  const validatedFields = SignUpFormSchema.safeParse(fieldsData);

  // Отобразить ошибки валидации
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      fieldsData,
    };
  }

  // Подготовить данные к созданию пользователя
  const { name, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Создать нового пользователя
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    if (!user) return { formError: USER_CREATION_ERROR, fieldsData };

    // Вызвать экшен для авторизации сразу после регистрации
    await signIn("credentials", formData);
  } catch (error) {
    // Next.js под капотом как-то использует эту ошибку для редиректа
    if (isRedirectError(error)) throw error;

    if (isUserAlreadyExistsError(error)) {
      return { formError: USER_ALREADY_EXISTS_ERROR, fieldsData };
    }

    return { formError: UNKNOWN_ERROR, fieldsData };
  }
}
