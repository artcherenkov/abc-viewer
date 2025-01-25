"use client";

import { signup } from "@/actions/auth";
import Link from "next/link";

export function SignUpForm() {
  return (
    <div className="max-w-lg">
      <h1 className="text-xl">Зарегистрироваться</h1>
      <form className="mt-8 flex flex-col gap-4" action={signup}>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Ваше имя</span>
          </div>
          <input
            type="text"
            placeholder="Имя"
            className="input input-bordered w-full"
          />
        </label>

        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Почта</span>
          </div>
          <input
            type="email"
            placeholder="Почта"
            className="input input-bordered w-full"
          />
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
        </label>

        <button className="btn mt-2" type="submit">
          Зарегистрироваться
        </button>
        <Link className="link" href="/sign-in">
          Уже есть аккаунт? Войти
        </Link>
      </form>
    </div>
  );
}
