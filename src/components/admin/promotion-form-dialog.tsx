"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { promotionSchema, type PromotionFormInput } from "@/lib/validation/promotion";
import { apiJson, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPE_LABELS: Record<string, string> = {
  PERCENT: "Процент",
  FIXED: "Фиксированная сумма",
};

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function PromotionFormDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const today = new Date();
  const inAMonth = new Date();
  inAMonth.setMonth(inAMonth.getMonth() + 1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PromotionFormInput>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      code: "",
      description: "",
      type: "PERCENT",
      value: 10,
      minOrderAmount: 0,
      usageLimit: null,
      validFrom: today,
      validTo: inAMonth,
      isActive: true,
    },
  });

  const type = watch("type");

  async function onSubmit(values: PromotionFormInput) {
    try {
      await apiJson("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      toast.success("Промокод создан");
      reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) setError("root", { message: error.message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={
          "bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium"
        }
      >
        <Plus className="size-4" /> Новый промокод
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый промокод</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="code">Код</Label>
            <Input id="code" {...register("code")} placeholder="SUMMER25" />
            {errors.code && (
              <p className="text-destructive text-sm">{errors.code.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Input id="description" {...register("description")} />
            {errors.description && (
              <p className="text-destructive text-sm">{errors.description.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Тип</Label>
              <Select
                value={type}
                onValueChange={(v) => v && setValue("type", v as "PERCENT" | "FIXED")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: unknown) => TYPE_LABELS[v as string]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENT">Процент</SelectItem>
                  <SelectItem value="FIXED">Фиксированная сумма</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Значение {type === "PERCENT" ? "(%)" : "(₽)"}</Label>
              <Input
                id="value"
                type="number"
                {...register("value", { valueAsNumber: true })}
              />
              {errors.value && (
                <p className="text-destructive text-sm">{errors.value.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="minOrderAmount">Мин. сумма заказа, ₽</Label>
              <Input
                id="minOrderAmount"
                type="number"
                {...register("minOrderAmount", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usageLimit">Лимит использований</Label>
              <Input
                id="usageLimit"
                type="number"
                placeholder="без лимита"
                {...register("usageLimit", {
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Действует с</Label>
              <Input
                id="validFrom"
                type="date"
                defaultValue={toDateInputValue(today)}
                {...register("validFrom", { valueAsDate: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validTo">Действует по</Label>
              <Input
                id="validTo"
                type="date"
                defaultValue={toDateInputValue(inAMonth)}
                {...register("validTo", { valueAsDate: true })}
              />
              {errors.validTo && (
                <p className="text-destructive text-sm">{errors.validTo.message}</p>
              )}
            </div>
          </div>
          {errors.root && (
            <p className="text-destructive text-sm">{errors.root.message}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Создаём…" : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
