"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { apiJson, ApiError } from "@/lib/api-client";

export function ProductImageManager({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: string[];
}) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await apiJson<{ images: string[] }>(
        `/api/admin/products/${productId}/images`,
        { method: "POST", body: formData },
      );
      setImages(data.images);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Не удалось загрузить фото");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(url: string) {
    try {
      const data = await apiJson<{ images: string[] }>(
        `/api/admin/products/${productId}/images?url=${encodeURIComponent(url)}`,
        { method: "DELETE" },
      );
      setImages(data.images);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Не удалось удалить фото");
    }
  }

  return (
    <div className="max-w-2xl space-y-3">
      <Label>Фотографии</Label>
      <div className="flex flex-wrap gap-3">
        {images.map((url) => (
          <div
            key={url}
            className="group border-border relative size-24 overflow-hidden rounded-lg border"
          >
            <Image src={url} alt="" fill sizes="96px" className="object-cover" />
            <button
              type="button"
              aria-label="Удалить фото"
              onClick={() => handleDelete(url)}
              className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="border-border text-muted-foreground hover:bg-muted flex size-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-xs"
        >
          <Upload className="size-4" aria-hidden />
          {uploading ? "Загрузка…" : "Добавить"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <p className="text-muted-foreground text-xs">
        JPEG, PNG или WebP, до 5 МБ. Без фото на витрине используется рисованная
        иллюстрация категории.
      </p>
    </div>
  );
}
