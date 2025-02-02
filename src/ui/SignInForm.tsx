"use client";

import Link from "next/link";
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
import { signin } from "@/lib/actions/authentication/signin";

const ErrorMessage = ({ children }: { children: string | string[] }) => (
  <p className="text-destructive text-sm">{children}</p>
);

export function SignInForm() {
  const [state, action, pending] = useActionState(signin, {
    status: { isAwaiting: true, isSuccess: false, isError: false },
    fieldsData: { email: "", password: "" },
  });
  const { status, errors, errorMessage, fieldsData } = state;

  const { toast } = useToast();

  useEffect(() => {
    if (status.isError) {
      toast({
        variant: "destructive",
        title: "Ошибка входа",
        description: errorMessage,
      });
    }
  }, [errorMessage, status, toast]);

  return (
    <div className="flex flex-col w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Вход</CardTitle>
          <CardDescription>
            Введите учетные данные для входа в систему
          </CardDescription>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </CardHeader>
        <CardContent>
          <form action={action} className="flex flex-col gap-6">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="email">Почта</Label>
              <Input
                type="email"
                id="email"
                name="email"
                defaultValue={fieldsData.email}
                placeholder="example@mail.ru"
                disabled={pending}
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
                disabled={pending}
              />
              {errors?.password?.map((err) => (
                <ErrorMessage key={err}>{err}</ErrorMessage>
              ))}
            </div>
            <Button type="submit" disabled={pending}>
              Войти
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Еще нет аккаунта?{" "}
            <Link href="/sign-up" className="underline underline-offset-4">
              Зарегистрироваться
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
