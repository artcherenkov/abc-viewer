import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ForgotPasswordCodeForm } from "@/components/containers/ForgotPasswordCodeForm";

export default async function ForgotPasswordPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return <ForgotPasswordCodeForm />;
}
