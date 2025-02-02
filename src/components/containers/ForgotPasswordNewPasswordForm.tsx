"use client";

import { redirect } from "next/navigation";
import { useActionState, useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { resetPassword } from "@/lib/actions/authentication/resetPassword";

const ErrorMessage = ({ children }: { children: string | string[] }) => (
  <p className="text-destructive text-sm">{children}</p>
);

export const ForgotPasswordResetForm = () => {
  // Используем useActionState для server action resetPassword
  const [state, action, pending] = useActionState(resetPassword, {
    status: { isAwaiting: true, isSuccess: false, isError: false },
  });
  const { status, errorMessage } = state;

  // При успешном сбросе пароля перенаправляем пользователя на страницу входа
  useEffect(() => {
    if (status.isSuccess) {
      redirect("/sign-in");
    }
  }, [status]);

  return (
    <div className="flex flex-col w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Придумайте новый пароль</CardTitle>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </CardHeader>
        <CardContent>
          <form action={action} className="flex flex-col gap-6">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input
                type="password"
                id="newPassword"
                name="newPassword"
                placeholder="Новый пароль"
                disabled={pending}
              />
            </div>
            <Button type="submit" disabled={pending}>
              Сбросить пароль
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
