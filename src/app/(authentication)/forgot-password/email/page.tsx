import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ForgotPasswordEmailForm } from "@/components/containers/ForgotPasswordEmailForm";

export default async function ForgotPasswordPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return <ForgotPasswordEmailForm />;
}
