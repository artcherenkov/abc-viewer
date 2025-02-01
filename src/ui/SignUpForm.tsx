"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";
import { sendVerificationCode } from "@/lib/actions/authentication/sendVerificationCode";
import { SignUpFormSchema } from "@/lib/descriptions/signUpFormSchema";

const formSchema = SignUpFormSchema;

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
      name: "Иван Примеров",
      email: "art.cherenkov@gmail.com",
      password: "test",
    },
    errors: {},
    errorMessage: "",
  });

  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const { status, errorMessage } = sendVerificationState;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: sendVerificationState?.fieldsData,
  });

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
          <Form {...form}>
            <form
              action={sendVerificationAction}
              ref={formRef}
              className="flex flex-col gap-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя</FormLabel>
                    <FormControl>
                      <Input
                        disabled={disableForm}
                        placeholder="Иван Примеров"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Почта</FormLabel>
                    <FormControl>
                      <Input
                        disabled={disableForm}
                        placeholder="ivan@primer.ru"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пароль</FormLabel>

                    <FormControl>
                      <Input
                        disabled={disableForm}
                        placeholder="Пароль"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
