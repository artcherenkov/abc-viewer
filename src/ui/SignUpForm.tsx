"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { useActionState, useEffect } from "react";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/hooks/useToast";
import { sendVerificationCode } from "@/lib/actions/authentication/sendVerificationCode";

const ErrorMessage = ({ children }: { children: string | string[] }) => (
  <p className="text-destructive text-sm">{children}</p>
);

export function SignUpForm() {
  const [
    sendVerificationState,
    sendVerificationAction,
    sendVerificationPending,
  ] = useActionState(sendVerificationCode, {
    status: {
      isAwaiting: true,
      isSuccess: false,
      isError: false,
      hasCodeSent: false,
    },
    fieldsData: {
      name: "",
      email: "",
      password: "",
    },
    errors: {},
    errorMessage: "",
  });

  const { toast } = useToast();

  const { status, errorMessage, errors, fieldsData } = sendVerificationState;

  useEffect(() => {
    if (status.isError) {
      toast({
        variant: "destructive",
        title: "Ошибка авторизации",
        description: errorMessage,
      });
    }
  }, [status, errorMessage, toast]);

  useEffect(() => {
    if (status.hasCodeSent) {
      toast({
        title: "Подтвердите почту",
        description: "На вашу почту отправлен код. Введите его в поле",
      });

      redirect("/verify-email");
    }
  }, [status, errorMessage, toast]);

  const disableForm = sendVerificationPending || status.hasCodeSent;

  return (
    <div className="flex flex-col w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Регистрация</CardTitle>
          <CardDescription>
            Введите свои данные, чтобы зарегистрироваться
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={sendVerificationAction} className="flex flex-col gap-6">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="name">Имя</Label>
              <Input
                type="text"
                id="name"
                name="name"
                defaultValue={fieldsData.name}
                placeholder="Иван Петров"
                disabled={disableForm}
              />
              {errors?.name?.map((err) => (
                <ErrorMessage key={err}>{err}</ErrorMessage>
              ))}
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="email">Почта</Label>
              <Input
                type="email"
                id="email"
                name="email"
                defaultValue={fieldsData.email}
                placeholder="ivan@petrov.ru"
                disabled={disableForm}
              />
              {errors?.email?.map((err) => (
                <ErrorMessage key={err}>{err}</ErrorMessage>
              ))}
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="password">Пароль</Label>
              <Input
                type="password"
                id="password"
                name="password"
                defaultValue={fieldsData.password}
                placeholder="Пароль"
                disabled={disableForm}
              />

              {errors?.password && (
                <>
                  <ErrorMessage>Пароль должен:</ErrorMessage>

                  <ul>
                    {errors?.password.map((err) => (
                      <li key={err}>
                        <ErrorMessage key={err}>– {err}</ErrorMessage>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <Button type="submit" disabled={disableForm}>
              Зарегистрироваться
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Уже есть аккаунт?{" "}
            <Link href="/sign-in" className="underline underline-offset-4">
              Войти
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
