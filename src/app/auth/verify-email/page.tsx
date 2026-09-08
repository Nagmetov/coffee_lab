"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiJson } from "@/lib/api-client";
import { useInvalidateCurrentUser } from "@/hooks/use-current-user";
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
        <p>Подтверждаем email…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="text-success size-8" aria-hidden />
        <p>Email подтверждён. Спасибо!</p>
        <Link href="/" className="text-foreground text-sm font-medium hover:underline">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <XCircle className="text-destructive size-8" aria-hidden />
      <p>Ссылка недействительна или уже была использована.</p>
      <Link href="/" className="text-foreground text-sm font-medium hover:underline">
        На главную
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Подтверждение email</CardTitle>
        <CardDescription>Один шаг до полного доступа к бонусам</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense>
          <VerifyEmailBody />
        </Suspense>
      </CardContent>
    </Card>
  );
}
