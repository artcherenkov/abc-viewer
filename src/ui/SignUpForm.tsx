"use client";

import { useActionState } from "react";
import Link from "next/link";

import { signup } from "@/actions/auth";

export function SignUpForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  const defaultValues = state?.fieldsData;

  return (
    <div className="max-w-lg">
      <h1 className="text-xl">Зарегистрироваться</h1>
      <form className="mt-8 flex flex-col gap-4" action={action}>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Ваше имя</span>
          </div>
          <input
            type="text"
            name="name"
            defaultValue={defaultValues?.name}
            placeholder="Имя"
            className="input input-bordered w-full"
          />
          {state?.errors?.name && (
            <div className="mt-0.5 ml-0.5 flex flex-col">
              <span className="label-text-alt text-red-400">
                {state?.errors?.name}
              </span>
            </div>
          )}
        </label>

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
            <div className="mt-0.5 ml-0.5">
              <p>Password must:</p>
              <ul className="flex flex-col">
                {state.errors.password.map((error) => (
                  <li key={error}>
                    <span className="label-text-alt text-red-400">
                      – {error}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </label>

        <button className="btn mt-2" type="submit" disabled={pending}>
          Зарегистрироваться
        </button>
        <Link className="link" href="/sign-in">
          Уже есть аккаунт? Войти
        </Link>
        {state?.message && <p className="text-red-4000">{state.message}</p>}
      </form>
    </div>
  );
}
