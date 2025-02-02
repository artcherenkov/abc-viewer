import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { OneTimeCodeForm } from "@/components/containers/OneTimeCodeForm";
import { getCookie } from "@/lib/helpers/cookie";
import { getRegistrationSession } from "@/lib/repositories/registrationSession";

import { prisma } from "../../../../prisma/prisma";

export default async function Page() {
  const session = await auth();
  if (session) redirect("/dashboard");

  const emailCookie = await getCookie("email");
  if (!emailCookie) {
    console.error("❌ Email не найден в cookie");

    return redirect("/sign-up");
  }
  const { value: email } = emailCookie;

  const registrationSession = await getRegistrationSession(prisma, email);
  if (!registrationSession) {
    console.error("❌ Сессия регистрации не найдена.");

    return redirect("/sign-up");
  }

  return <OneTimeCodeForm />;
}
