"use client";

import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { redirect } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  InputOtp,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/InputOtp";
import { verifyResetCode } from "@/lib/actions/authentication/resetPassword";

const ErrorMessage = ({ children }: { children: string | string[] }) => (
  <p className="text-destructive text-sm">{children}</p>
);

export const ForgotPasswordCodeForm = () => {
  const [state, action, pending] = useActionState(verifyResetCode, {
    status: {
      isAwaiting: true,
      isSuccess: false,
      isError: false,
    },
    fieldsData: { code: "" },
  });
  const { errorMessage, status } = state;

  useEffect(() => {
    if (status.isSuccess) {
      redirect("/forgot-password/new-password");
    }
  }, [status]);

  const otpFormRef = useRef<HTMLFormElement>(null);
  const [otpValue, setOtpValue] = useState("");

  return (
    <div className="flex flex-col w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Введите одноразовый код</CardTitle>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </CardHeader>
        <CardContent>
          <form
            action={action}
            className="flex flex-col gap-6"
            ref={otpFormRef}
          >
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <InputOtp
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                name="code"
                value={otpValue}
                onChange={(value) => setOtpValue(value)}
                onComplete={() => {
                  otpFormRef.current?.requestSubmit();
                }}
                disabled={pending}
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
