"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
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

export default function RegisterPage() {
  const router = useRouter();
  const invalidateUser = useInvalidateCurrentUser();
  const { t } = useLocale();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    try {
      const result = await apiJson<{ devVerificationUrl?: string }>("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      await invalidateUser();

      if (result.devVerificationUrl) {
        // No email provider configured — jump straight to the verification
        // link instead of sending the user to check a mailbox that will
        // stay empty.
        toast.success(t.auth.register.createdToast, {
          description: t.auth.register.devModeDesc,
        });
        router.push(result.devVerificationUrl);
      } else {
        toast.success(t.auth.register.createdToast, {
          description: `${t.auth.register.emailSentDescPrefix} ${values.email}.`,
        });
        router.push("/");
      }
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
        <CardTitle className="font-heading text-2xl">{t.auth.register.title}</CardTitle>
        <CardDescription>{t.auth.register.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">{t.auth.register.name}</Label>
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
            <Label htmlFor="email">{t.auth.register.email}</Label>
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
            <Label htmlFor="password">{t.auth.register.password}</Label>
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
            <p className="text-muted-foreground text-xs">{t.auth.register.passwordHint}</p>
          </div>
          {errors.root && (
            <p className="text-destructive text-sm">{errors.root.message}</p>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t.auth.register.submitting : t.auth.register.submit}
          </Button>
        </form>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          {t.auth.register.haveAccount}{" "}
          <Link
            href="/auth/login"
            className="text-foreground font-medium hover:underline"
          >
            {t.auth.register.loginLink}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
