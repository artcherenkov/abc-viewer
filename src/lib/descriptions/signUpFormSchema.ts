import { z } from "zod";

export const SignUpFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Имя должно быть длиннее двух символов." })
    .trim(),
  email: z
    .string()
    .email({ message: "Введите корректный email." })
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .regex(/[a-zA-Z]/, { message: "Содержать хотя бы одну букву." })
    .trim(),
});
