"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";

import { signIn } from "@/auth";
import {
  INVALID_CREDENTIALS_ERROR,
  UNKNOWN_ERROR,
} from "@/lib/constants/errors";
import { SignInFormSchema } from "@/lib/descriptions/signInFormSchema";
import { isInvalidPasswordError } from "@/lib/helpers/errors";

export async function signin(_prevState: unknown, formData: FormData) {
  const fieldsData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // Провалидировать данные из формы
  const validatedFields = SignInFormSchema.safeParse(fieldsData);

  // Отобразить ошибки валидации
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      fieldsData,
    };
  }

  try {
    // Авторизовать пользователя
    await signIn("credentials", formData);
  } catch (error) {
    // Next.js под капотом как-то использует эту ошибку для редиректа
    if (isRedirectError(error)) throw error;

    if (isInvalidPasswordError(error)) {
      return { fieldsData, message: INVALID_CREDENTIALS_ERROR };
    }

    return { message: UNKNOWN_ERROR };
  }
}
