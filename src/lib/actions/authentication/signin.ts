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
  const validated = SignInFormSchema.safeParse(fieldsData);

  // Отобразить ошибки валидации
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      fieldsData,
    };
  }

  try {
    // Авторизовать пользователя
    await signIn("credentials", validated.data);
  } catch (error) {
    // Next.js под капотом как-то использует эту ошибку для редиректа
    if (isRedirectError(error)) throw error;

    if (isInvalidPasswordError(error)) {
      return { fieldsData, formError: INVALID_CREDENTIALS_ERROR };
    }

    return { formError: UNKNOWN_ERROR };
  }
}
