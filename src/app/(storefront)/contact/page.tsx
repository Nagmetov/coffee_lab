"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { MapPin, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiJson, ApiError } from "@/lib/api-client";
import { useLocale } from "@/components/locale-provider";

const schema = z.object({
  name: z.string().trim().min(1, "Укажите имя"),
  email: z.string().trim().email("Некорректный email"),
  message: z.string().trim().min(5, "Сообщение слишком короткое"),
});

type FormValues = z.infer<typeof schema>;

export default function ContactPage() {
  const { t } = useLocale();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await apiJson("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      toast.success(t.contact.successToast);
      reset();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t.contact.errorToast);
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-10 px-4 py-16 sm:grid-cols-2">
      <div>
        <h1 className="font-heading mb-6 text-4xl font-semibold">{t.contact.title}</h1>
        <ul className="text-muted-foreground space-y-4">
          <li className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden />
            <span>{t.contact.address}</span>
          </li>
          <li className="flex items-start gap-3">
            <Clock className="mt-0.5 size-5 shrink-0" aria-hidden />
            <span>{t.contact.hours}</span>
          </li>
          <li className="flex items-start gap-3">
            <Phone className="mt-0.5 size-5 shrink-0" aria-hidden />
            <span>{t.contact.phone}</span>
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">{t.contact.name}</Label>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && (
            <p className="text-destructive text-sm">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t.contact.email}</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-destructive text-sm">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">{t.contact.message}</Label>
          <Textarea
            id="message"
            rows={4}
            {...register("message")}
            aria-invalid={!!errors.message}
          />
          {errors.message && (
            <p className="text-destructive text-sm">{errors.message.message}</p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t.contact.submitting : t.contact.submit}
        </Button>
      </form>
    </div>
  );
}
