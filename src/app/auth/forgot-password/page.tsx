"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { z } from "zod";
import { apiJson } from "@/lib/api-client";
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

type FormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: FormValues) {
    const result = await apiJson<{ devResetUrl?: string }>("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setDevResetUrl(result.devResetUrl ?? null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">
          {t.auth.forgotPassword.title}
        </CardTitle>
        <CardDescription>{t.auth.forgotPassword.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {isSubmitSuccessful ? (
          <div className="space-y-4 text-sm">
            <p>{t.auth.forgotPassword.successText}</p>
            {devResetUrl && (
              <p className="bg-muted text-muted-foreground rounded-md p-3 text-xs">
                {t.auth.forgotPassword.devModeLabel}{" "}
                <Link href={devResetUrl} className="text-foreground underline">
                  {t.auth.forgotPassword.openLink}
                </Link>
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.forgotPassword.email}</Label>
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? t.auth.forgotPassword.submitting
                : t.auth.forgotPassword.submit}
            </Button>
          </form>
        )}
        <p className="text-muted-foreground mt-6 text-center text-sm">
          <Link
            href="/auth/login"
            className="text-foreground font-medium hover:underline"
          >
            {t.auth.forgotPassword.backToLogin}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
