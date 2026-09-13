"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { apiJson, ApiError } from "@/lib/api-client";
import { useInvalidateCurrentUser } from "@/hooks/use-current-user";
import { useLocale } from "@/components/locale-provider";
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invalidateUser = useInvalidateCurrentUser();
  const { t } = useLocale();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    try {
      await apiJson("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      await invalidateUser();
      toast.success(t.auth.login.welcomeToast);
      router.push(searchParams.get("next") ?? "/");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setError("root", { message: error.message });
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">{t.auth.login.email}</Label>
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
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t.auth.login.password}</Label>
          <Link
            href="/auth/forgot-password"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            {t.auth.login.forgot}
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-destructive text-sm">{errors.password.message}</p>
        )}
      </div>
      {errors.root && <p className="text-destructive text-sm">{errors.root.message}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t.auth.login.submitting : t.auth.login.submit}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  const { t } = useLocale();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">{t.auth.login.title}</CardTitle>
        <CardDescription>{t.auth.login.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          {t.auth.login.noAccount}{" "}
          <Link
            href="/auth/register"
            className="text-foreground font-medium hover:underline"
          >
            {t.auth.login.registerLink}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
