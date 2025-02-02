"use client";

import { User } from "next-auth";
import { useActionState } from "react";

import FileUploader from "@/components/containers/FileUploader";
import { signout } from "@/lib/actions/authentication/signout";

interface IDashboardProps {
  user?: User;
}

export function Dashboard(props: IDashboardProps) {
  const [state, action, pending] = useActionState(signout, undefined);

  return (
    <div>
      <h1 className="text-xl">Dashboard</h1>

      <form action={action}>
        <h2 className="mt-10 text-lg">your email: {props.user?.email}</h2>

        <button className="btn mt-4" type="submit" disabled={pending}>
          Выйти
        </button>

        <FileUploader />

        <p className="text-red-400 mt-2">{state?.message}</p>
      </form>
    </div>
  );
}
