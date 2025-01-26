import { z } from "zod";

export const SignInFormSchema = z.object({
  email: z.string().email({ message: "Введите корректный email." }).trim(),
  password: z
    .string({ required_error: "Введите пароль" })
    .min(1, { message: "Введите пароль" })
    .trim(),
});
