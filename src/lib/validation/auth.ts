import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Имя должно быть не короче 2 символов").max(80),
  email: z.string().trim().toLowerCase().email("Некорректный email"),
  password: z
    .string()
    .min(8, "Пароль должен быть не короче 8 символов")
    .regex(/[a-zA-Zа-яА-Я]/, "Пароль должен содержать буквы")
    .regex(/[0-9]/, "Пароль должен содержать цифру"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Некорректный email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Пароль должен быть не короче 8 символов")
    .regex(/[a-zA-Zа-яА-Я]/, "Пароль должен содержать буквы")
    .regex(/[0-9]/, "Пароль должен содержать цифру"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
