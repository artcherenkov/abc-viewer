import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Dashboard } from "@/components/containers/Dashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return <Dashboard user={session.user} />;
}
