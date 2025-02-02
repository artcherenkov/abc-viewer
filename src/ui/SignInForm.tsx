"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useActionState, useEffect } from "react";
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
import { signin } from "@/lib/actions/authentication/signin";
import { SignInFormSchema } from "@/lib/descriptions/signInFormSchema";

const formSchema = SignInFormSchema;

export function SignInForm() {
  const [state, action, pending] = useActionState(signin, {
    errors: {},
    fieldsData: {
      email: "",
      password: "",
    },
  });

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: state?.fieldsData,
  });

  useEffect(() => {
    if (!pending && state?.formError) {
      toast({
        variant: "destructive",
        title: "Ошибка регистрации",
        description: state.formError,
      });
    }
  }, [state?.formError, pending, toast]);

  return (
    <div className="flex flex-col w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Вход</CardTitle>
          <CardDescription>
            Введите учетные данные для входа в систему
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form action={action} className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Почта</FormLabel>
                    <FormControl>
                      <Input placeholder="ivan@primer.ru" {...field} />
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
                    <div className="flex">
                      <FormLabel>Пароль</FormLabel>
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Забыли? Сбросить
                      </a>
                    </div>
                    <FormControl>
                      <Input placeholder="Пароль" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
