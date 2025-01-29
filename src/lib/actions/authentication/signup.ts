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
import { generateVerificationToken } from "@/lib/helpers/generateVerificationToken";
import { sendVerificationEmail } from "@/lib/helpers/sendVerificationEmail";

import { prisma } from "../../../../prisma/prisma";

type TFieldsErrors = {
  name?: string[];
  email?: string[];
  password?: string[];
};

export async function signup(
  _prevState: unknown,
  formData: FormData,
): Promise<{
  success: boolean;
  fieldsData: { name: string; email: string; password: string };
  errors?: TFieldsErrors;
  errorMessage?: string;
}> {
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
      success: false,
      fieldsData,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  // Подготовить данные к созданию пользователя
  const { name, email, password } = validated.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Создать нового пользователя
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    if (!user)
      return {
        success: false,
        fieldsData,
        errorMessage: USER_CREATION_ERROR,
      };

    // Сгенерировать токен и отправить ссылку-подтверждение на почту
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(email, verificationToken.token);

    // Вызвать экшен для авторизации сразу после регистрации
    await signIn("credentials", validated.data);

    return {
      success: true,
      fieldsData,
    };
  } catch (error) {
    // Next.js под капотом как-то использует эту ошибку для редиректа
    if (isRedirectError(error)) throw error;

    if (isUserAlreadyExistsError(error)) {
      return {
        success: false,
        fieldsData,
        errorMessage: USER_ALREADY_EXISTS_ERROR,
      };
    }

    return {
      success: false,
      fieldsData,
      errorMessage: UNKNOWN_ERROR,
    };
  }
}
