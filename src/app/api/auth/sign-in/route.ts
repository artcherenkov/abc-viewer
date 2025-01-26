import { NextResponse } from "next/server";

import { signIn } from "@/auth";
import {
  INVALID_CREDENTIALS_ERROR,
  UNKNOWN_ERROR,
} from "@/lib/constants/errors";
import { SignInFormSchema } from "@/lib/descriptions/signInFormSchema";
import { isInvalidPasswordError } from "@/lib/helpers/errors";

export const POST = async (req: Request) => {
  const { email, password } = await req.json();

  const validated = SignInFormSchema.safeParse({ email, password });

  if (!validated.success) {
    return NextResponse.json(
      {
        success: false,
        errors: validated.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    await signIn("credentials", {
      email: validated.data?.email,
      password: validated.data?.password,
      redirect: false,
    });
  } catch (err) {
    if (isInvalidPasswordError(err)) {
      return NextResponse.json(
        { success: false, error: INVALID_CREDENTIALS_ERROR },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: UNKNOWN_ERROR },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
};
