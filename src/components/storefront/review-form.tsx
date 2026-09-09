"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiJson, ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export function ReviewForm({ productSlug }: { productSlug: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiJson(`/api/products/${productSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      toast.success("Спасибо за отзыв!");
      setComment("");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Не удалось отправить отзыв",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border space-y-3 rounded-lg border p-4"
    >
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Оценка">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={value === rating}
            aria-label={`${value} из 5`}
            onClick={() => setRating(value)}
          >
            <Star
              className={cn(
                "size-6 transition-colors",
                value <= rating ? "fill-warning text-warning" : "text-muted-foreground",
              )}
            />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Поделитесь впечатлением о напитке…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        minLength={3}
        required
      />
      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Отправляем…" : "Оставить отзыв"}
      </Button>
    </form>
  );
}
