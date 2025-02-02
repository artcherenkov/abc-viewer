"use client";

import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { redirect } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  InputOtp,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/InputOtp";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/hooks/useToast";
import { resendVerificationCode } from "@/lib/actions/authentication/resendVerificationCode";
import { verifyCodeAndCreateUser } from "@/lib/actions/authentication/verifyCodeAndCreateUser";

export function OneTimeCodeForm() {
  const otpFormRef = useRef<HTMLFormElement>(null);

  // Таймер для повторной отправки кода
  const [resendTimer, setResendTimer] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);

  const [resendCodeState, resendCodeAction, resendCodePending] = useActionState(
    resendVerificationCode,
    {
      status: {
        isAwaiting: true,
        isSuccess: false,
        isError: false,
      },
    },
  );

  const [state, action, pending] = useActionState(verifyCodeAndCreateUser, {
    status: {
      isAwaiting: true,
      isSuccess: false,
      isError: false,
    },
  });
  const { status, error, redirectToSignUp } = state;

  const [otpValue, setOtpValue] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    if (redirectToSignUp || resendCodeState.redirectToSignUp) {
      toast({
        variant: "destructive",
        title: "Ошибка верификации кода",
        description: resendCodeState.error || error,
      });

      redirect("/sign-up");
    }
  }, [
    error,
    redirectToSignUp,
    resendCodeState.error,
    resendCodeState.redirectToSignUp,
    toast,
  ]);

  useEffect(() => {
    if (status.isError) {
      setOtpValue("");

      toast({
        variant: "destructive",
        title: "Ошибка верификации кода",
        description: error,
      });
    }
  }, [status, error, toast]);

  useEffect(() => {
    if (resendCodeState.status.isError) {
      toast({
        variant: "destructive",
        title: "Ошибка верификации кода",
        description: resendCodeState.error,
      });
    }
  }, [
    status,
    error,
    toast,
    resendCodeState.status.isError,
    resendCodeState.error,
  ]);

  // Запуск таймера после успешной отправки кода
  useEffect(() => {
    if (resendCodeState.status.isSuccess) {
      setResendTimer(60);
      setIsResendDisabled(true);
    }
  }, [resendCodeState.status.isSuccess]);

  // Отсчет таймера
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setIsResendDisabled(false);
    }
  }, [resendTimer]);

  return (
    <div className="flex flex-col w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Подтверждение почты</CardTitle>
          <CardDescription>
            Введите код из письма, чтобы подтвердить почту
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={action}
            className="flex flex-col gap-6"
            ref={otpFormRef}
          >
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="name">Имя</Label>
              <InputOtp
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                name="code"
                value={otpValue}
                onChange={(value) => setOtpValue(value)}
                onComplete={() => {
                  otpFormRef.current?.requestSubmit();
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOtp>
            </div>

            <Button type="submit" disabled={pending}>
              Подтвердить
            </Button>
          </form>
          {status.isError && (
            <form action={resendCodeAction}>
              <Button
                className="mt-2 px-0"
                type="submit"
                disabled={isResendDisabled || resendCodePending}
                variant="link"
                size="sm"
              >
                {isResendDisabled
                  ? `Отправить код снова (${resendTimer} сек)`
                  : "Отправить код снова"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
