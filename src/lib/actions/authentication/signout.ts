"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";

import { signOut } from "@/auth";
import { UNKNOWN_ERROR } from "@/lib/constants/errors";

export async function signout() {
  try {
    await signOut();
  } catch (error) {
    if (isRedirectError(error)) throw error;

    return { message: UNKNOWN_ERROR };
  }
}
