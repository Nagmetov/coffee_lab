"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { z } from "zod";
import { apiJson } from "@/lib/api-client";
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
        <CardTitle className="font-heading text-2xl">Сброс пароля</CardTitle>
        <CardDescription>
          Укажите email — пришлём ссылку для сброса пароля
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSubmitSuccessful ? (
          <div className="space-y-4 text-sm">
            <p>
              Если аккаунт с этим email существует, на него отправлена ссылка для сброса
              пароля.
            </p>
            {devResetUrl && (
              <p className="bg-muted text-muted-foreground rounded-md p-3 text-xs">
                Демо-режим (без почтового провайдера):{" "}
                <Link href={devResetUrl} className="text-foreground underline">
                  открыть ссылку сброса
                </Link>
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Отправляем…" : "Отправить ссылку"}
            </Button>
          </form>
        )}
        <p className="text-muted-foreground mt-6 text-center text-sm">
          <Link
            href="/auth/login"
            className="text-foreground font-medium hover:underline"
          >
            Вернуться ко входу
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
