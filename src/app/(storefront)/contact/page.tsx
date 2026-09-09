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

const schema = z.object({
  name: z.string().trim().min(1, "Укажите имя"),
  email: z.string().trim().email("Некорректный email"),
  message: z.string().trim().min(5, "Сообщение слишком короткое"),
});

type FormValues = z.infer<typeof schema>;

export default function ContactPage() {
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
      toast.success("Сообщение отправлено, спасибо!");
      reset();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Не удалось отправить сообщение",
      );
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-10 px-4 py-16 sm:grid-cols-2">
      <div>
        <h1 className="font-heading mb-6 text-4xl font-semibold">Контакты</h1>
        <ul className="text-muted-foreground space-y-4">
          <li className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden />
            <span>ул. Кофейная, 12, Москва</span>
          </li>
          <li className="flex items-start gap-3">
            <Clock className="mt-0.5 size-5 shrink-0" aria-hidden />
            <span>Ежедневно, 8:00–21:00</span>
          </li>
          <li className="flex items-start gap-3">
            <Phone className="mt-0.5 size-5 shrink-0" aria-hidden />
            <span>+7 (900) 123-45-67</span>
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Имя</Label>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && (
            <p className="text-destructive text-sm">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
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
          <Label htmlFor="message">Сообщение</Label>
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
          {isSubmitting ? "Отправляем…" : "Отправить"}
        </Button>
      </form>
    </div>
  );
}
