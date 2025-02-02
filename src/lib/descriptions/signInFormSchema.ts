import { z } from "zod";

export const SignInFormSchema = z.object({
  email: z
    .string({ required_error: "Введите email." })
    .email({ message: "Введите корректный email." })
    .trim(),
  password: z
    .string({ required_error: "Введите пароль" })
    .min(1, "Введите пароль")
    .trim(),
});
