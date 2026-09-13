"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiJson } from "@/lib/api-client";
import { useInvalidateCurrentUser } from "@/hooks/use-current-user";
import { useLocale } from "@/components/locale-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

type Status = "loading" | "success" | "error";

function VerifyEmailBody() {
  const token = useSearchParams().get("token");
  const invalidateUser = useInvalidateCurrentUser();
  const { t } = useLocale();
  const [status, setStatus] = useState<Status>(token ? "loading" : "error");
  const requestedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!token || requestedFor.current === token) return;
    requestedFor.current = token;
    apiJson("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(() => {
        setStatus("success");
        invalidateUser();
      })
      .catch(() => setStatus("error"));
  }, [token, invalidateUser]);

  if (status === "loading") {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-3 py-6">
        <Loader2 className="size-6 animate-spin" aria-hidden />
        <p>{t.auth.verifyEmail.loading}</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="text-success size-8" aria-hidden />
        <p>{t.auth.verifyEmail.success}</p>
        <Link href="/" className="text-foreground text-sm font-medium hover:underline">
          {t.auth.verifyEmail.backHome}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <XCircle className="text-destructive size-8" aria-hidden />
      <p>{t.auth.verifyEmail.error}</p>
      <Link href="/" className="text-foreground text-sm font-medium hover:underline">
        {t.auth.verifyEmail.toHome}
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  const { t } = useLocale();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">
          {t.auth.verifyEmail.title}
        </CardTitle>
        <CardDescription>{t.auth.verifyEmail.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense>
          <VerifyEmailBody />
        </Suspense>
      </CardContent>
    </Card>
  );
}
