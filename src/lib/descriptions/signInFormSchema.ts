import { z } from "zod";

export const SignInFormSchema = z.object({
  email: z.string().email({ message: "Введите корректный email." }).trim(),
  password: z.string().min(1, { message: "Введите пароль" }).trim(),
});
