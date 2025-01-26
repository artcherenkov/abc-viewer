"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signin } from "@/lib/actions/authentication/signin";

export function SignInForm() {
  const [state, action, pending] = useActionState(signin, {
    errors: {},
    fieldsData: {
      email: "test@test.com",
      password: "test",
    },
  });

  const defaultValues = state?.fieldsData;

  return (
    <div className="max-w-lg">
      <h1 className="text-xl">Войти</h1>
      <form className="mt-8 flex flex-col gap-4" action={action}>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Почта</span>
          </div>
          <input
            type="email"
            name="email"
            defaultValue={defaultValues?.email}
            placeholder="Почта"
            className="input input-bordered w-full"
          />
          {state?.errors?.email && (
            <div className="mt-0.5 ml-0.5 flex flex-col">
              <span className="label-text-alt text-red-400">
                {state?.errors?.email}
              </span>
            </div>
          )}
        </label>

        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Пароль</span>
          </div>
          <input
            type="password"
            name="password"
            defaultValue={defaultValues?.password}
            placeholder="Пароль"
            className="input input-bordered w-full"
          />
          {state?.errors?.password && (
            <div className="mt-0.5 ml-0.5 flex flex-col">
              <span className="label-text-alt text-red-400">
                {state?.errors?.password}
              </span>
            </div>
          )}
        </label>

        <button className="btn mt-2" type="submit" disabled={pending}>
          Войти
        </button>
        <Link className="link" href="/sign-up">
          Еще нет аккаунта? Зарегистрироваться
        </Link>
        {state?.message && <p className="text-red-400">{state.message}</p>}
      </form>
    </div>
  );
}
