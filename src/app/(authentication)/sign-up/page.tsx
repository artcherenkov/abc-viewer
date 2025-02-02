import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignUpForm } from "@/components/containers/SignUpForm";

export default async function SignInPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return <SignUpForm />;
}
