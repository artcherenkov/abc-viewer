"use client";

import Link from "next/link";
import { signin } from "@/actions/auth";

export function SignInForm() {
  return (
    <div className="max-w-lg">
      <h1 className="text-xl">Войти</h1>
      <form className="mt-8 flex flex-col gap-4" action={signin}>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Почта</span>
          </div>
          <input
            type="email"
            placeholder="Почта"
            className="input input-bordered w-full"
          />
          <div className="label hidden">
            <span className="label-text-alt">Bottom Left label</span>
          </div>
        </label>

        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Пароль</span>
          </div>
          <input
            type="password"
            placeholder="Пароль"
            className="input input-bordered w-full"
          />
          <div className="label hidden">
            <span className="label-text-alt">Bottom Left label</span>
          </div>
        </label>

        <button className="btn mt-2" type="submit">
          Войти
        </button>
        <Link className="link" href="/sign-up">
          Еще нет аккаунта? Зарегистрироваться
        </Link>
      </form>
    </div>
  );
}
