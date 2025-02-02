import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ForgotPasswordResetForm } from "@/components/containers/ForgotPasswordNewPasswordForm";

export default async function ForgotPasswordPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return <ForgotPasswordResetForm />;
}
