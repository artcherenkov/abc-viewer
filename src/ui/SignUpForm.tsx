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
import { signup } from "@/lib/actions/authentication/signup";
import { SignUpFormSchema } from "@/lib/descriptions/signUpFormSchema";

const formSchema = SignUpFormSchema;

export function SignUpForm() {
  const [state, action, pending] = useActionState(signup, {
    errors: {},
    fieldsData: {
      name: "Иван Примеров",
      email: "ivan@primer.ru",
      password: "test",
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
        title: "Ошибка авторизации",
        description: state.formError,
      });
    }
  }, [state?.formError, pending, toast]);

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
            <form action={action} className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя</FormLabel>
                    <FormControl>
                      <Input placeholder="Иван Примеров" {...field} />
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
                    <FormLabel>Пароль</FormLabel>

                    <FormControl>
                      <Input placeholder="Пароль" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={pending}>
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
