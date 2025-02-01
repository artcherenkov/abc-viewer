import { z } from "zod";

export const SignUpFormSchema = z.object({
  name: z
    .string({ required_error: "Введите имя" })
    .min(2, { message: "Имя должно быть длиннее двух символов." })
    .trim(),
  email: z
    .string({ required_error: "Введите email" })
    .email({ message: "Введите корректный email." })
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .regex(/[a-zA-Z]/, { message: "Содержать хотя бы одну букву." })
    .trim(),
});
