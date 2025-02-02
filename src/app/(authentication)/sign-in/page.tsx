import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignInForm } from "@/components/containers/SignInForm";

export default async function SignInPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return <SignInForm />;
}
