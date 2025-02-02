"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";

import { signIn } from "@/auth";
import {
  INVALID_CREDENTIALS_ERROR,
  UNKNOWN_ERROR,
} from "@/lib/constants/errors";
import { SignInFormSchema } from "@/lib/descriptions/signInFormSchema";
import { isInvalidPasswordError } from "@/lib/helpers/errors";

type TSignInStatus = Record<"isAwaiting" | "isSuccess" | "isError", boolean>;

type TSendVerificationCode = {
  status: TSignInStatus;
  fieldsData: { email: string; password: string };
  errors?: Record<string, string[]>;
  errorMessage?: string;
};

export async function signin(
  _prevState: unknown,
  formData: FormData,
): Promise<TSendVerificationCode> {
  const fieldsData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // Провалидировать данные из формы
  const validated = SignInFormSchema.safeParse(fieldsData);

  // Отобразить ошибки валидации
  if (!validated.success) {
    return {
      status: { isAwaiting: false, isSuccess: false, isError: true },
      fieldsData,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    // Авторизовать пользователя
    await signIn("credentials", validated.data);

    return {
      status: { isAwaiting: false, isSuccess: true, isError: false },
      fieldsData,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    if (isInvalidPasswordError(error)) {
      return {
        status: { isAwaiting: false, isSuccess: false, isError: true },
        fieldsData,
        errorMessage: INVALID_CREDENTIALS_ERROR,
      };
    }

    return {
      status: { isAwaiting: false, isSuccess: false, isError: true },
      fieldsData,
      errorMessage: UNKNOWN_ERROR,
    };
  }
}
