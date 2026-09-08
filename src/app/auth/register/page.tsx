"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
import { apiJson, ApiError } from "@/lib/api-client";
import { useInvalidateCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const invalidateUser = useInvalidateCurrentUser();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    try {
      const result = await apiJson<{ devVerificationUrl: string }>("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      await invalidateUser();
      toast.success("Аккаунт создан!", {
        description: "Подтвердите email, чтобы получать бонусы за заказы.",
      });
      router.push(result.devVerificationUrl);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fieldErrors) {
          for (const [field, messages] of Object.entries(error.fieldErrors)) {
            if (messages?.[0]) {
              setError(field as keyof RegisterInput, { message: messages[0] });
            }
          }
        } else {
          setError("root", { message: error.message });
        }
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Регистрация</CardTitle>
        <CardDescription>
          Копите баллы и следите за заказами в личном кабинете
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              autoComplete="name"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password.message}</p>
            )}
            <p className="text-muted-foreground text-xs">
              Минимум 8 символов, буквы и цифры
            </p>
          </div>
          {errors.root && (
            <p className="text-destructive text-sm">{errors.root.message}</p>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Создаём аккаунт…" : "Зарегистрироваться"}
          </Button>
        </form>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          Уже есть аккаунт?{" "}
          <Link
            href="/auth/login"
            className="text-foreground font-medium hover:underline"
          >
            Войти
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
