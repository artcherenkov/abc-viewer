"use server";

import { cookies } from "next/headers";

const ONE_HOUR = 60 * 60;

interface ISetCookieOptions {
  name: string;
  value: string;
  path?: string;
  maxAge?: number;
}

export async function setHttpOnlyCookie({
  name,
  value,
  path = "/",
  maxAge = ONE_HOUR,
}: ISetCookieOptions) {
  const cookieStore = await cookies();
  cookieStore.set({
    name,
    value,
    httpOnly: true,
    path,
    // secure: true, // передачи cookie только по HTTPS
    maxAge,
  });
}

export async function getCookie(name: string) {
  const cookieStore = await cookies();
  return cookieStore.get(name);
}
