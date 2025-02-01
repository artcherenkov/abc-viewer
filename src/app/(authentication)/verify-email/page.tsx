import { AlertCircle, CircleCheck, Terminal } from "lucide-react";
import Link from "next/link";
import React, { Suspense } from "react";
import colors from "tailwindcss/colors";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { verifyEmail } from "@/lib/actions/authentication/verifyEmail";

interface IVerifyEmailProps {
  email?: string;
  token?: string;
}

const VerifyEmail = async ({ email, token }: IVerifyEmailProps) => {
  const data = await verifyEmail({ token, email });

  if (!data.success) {
    return (
      <Link href="/sign-up">
        <Alert
          variant="destructive"
          className="cursor-pointer hover:opacity-60 active:opacity-30"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-bold">Ошибка</AlertTitle>
          <AlertDescription>
            {data.error}.{" "}
            <span className="underline underline-offset-4">
              Попробуйте еще раз
            </span>
          </AlertDescription>
        </Alert>
      </Link>
    );
  }

  return (
    <Link href="/dashboard">
      <Alert className="border-green-500 cursor-pointer hover:opacity-60 active:opacity-30">
        <CircleCheck className="h-5 w-5" color={colors.green["500"]} />
        <AlertTitle className="text-green-500 font-bold">
          Ваша почта подтверждена
        </AlertTitle>
        <AlertDescription className="text-green-500 underline underline-offset-4">
          Вернуться в приложение
        </AlertDescription>
      </Alert>
    </Link>
  );
};

type TSearchParams = {
  email?: string;
  token?: string;
};
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<TSearchParams>;
}) {
  const { email, token } = await searchParams;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Подтверждение почты</CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="h-16 w-full" />}>
          <VerifyEmail email={email} token={token} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
