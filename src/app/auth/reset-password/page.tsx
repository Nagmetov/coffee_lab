"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { z } from "zod";
import { apiJson, ApiError } from "@/lib/api-client";
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

type FormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const { t } = useLocale();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  async function onSubmit(values: FormValues) {
    try {
      await apiJson("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      toast.success(t.auth.resetPassword.successToast);
      router.push("/auth/login");
    } catch (error) {
      if (error instanceof ApiError) {
        setError("root", { message: error.message });
      }
    }
  }

  if (!token) {
    return (
      <p className="text-destructive text-sm">{t.auth.resetPassword.invalidLink}</p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <input type="hidden" {...register("token")} />
      <div className="space-y-2">
        <Label htmlFor="password">{t.auth.resetPassword.newPassword}</Label>
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
      </div>
      {errors.root && <p className="text-destructive text-sm">{errors.root.message}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t.auth.resetPassword.submitting : t.auth.resetPassword.submit}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLocale();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">
          {t.auth.resetPassword.title}
        </CardTitle>
        <CardDescription>{t.auth.resetPassword.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          <Link
            href="/auth/login"
            className="text-foreground font-medium hover:underline"
          >
            {t.auth.resetPassword.backToLogin}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
