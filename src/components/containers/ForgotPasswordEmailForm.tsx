"use client";

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
import { sendResetCode } from "@/lib/actions/authentication/resetPassword";

const ErrorMessage = ({ children }: { children: string | string[] }) => (
  <p className="text-destructive text-sm">{children}</p>
);

export const ForgotPasswordEmailForm = () => {
  const [state, action, pending] = useActionState(sendResetCode, {
    status: {
      isAwaiting: true,
      isSuccess: false,
      isError: false,
    },
    fieldsData: { email: "" },
  });
  const { status, fieldsData, errors, errorMessage } = state;

  useEffect(() => {
    if (status.isSuccess) {
      redirect("/forgot-password/code");
    }
  }, [status]);

  return (
    <div className="flex flex-col w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Восстановление доступа</CardTitle>
          <CardDescription>
            Введите адрес электронной почты, чтобы получить одноразовый код
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
            <Button type="submit" disabled={pending}>
              Запросить одноразовый код
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
