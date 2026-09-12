import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireAdminSession } from "@/lib/api/admin-guard";
import { addProductImage, removeProductImage } from "@/server/product-service";
import { handleApiError, isSameOrigin, jsonError } from "@/lib/api/respond";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(request)) {
    return jsonError("Недопустимый источник запроса", 403);
  }

  const guard = await requireAdminSession();
  if ("error" in guard) return guard.error;

  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return jsonError("Файл не найден", 400);
    }

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return jsonError("Допустимы только изображения JPEG, PNG или WebP", 415);
    }
    if (file.size > MAX_SIZE_BYTES) {
      return jsonError("Файл слишком большой (максимум 5 МБ)", 413);
    }

    const dir = path.join(process.cwd(), "public", "uploads", "products", id);
    await mkdir(dir, { recursive: true });
    const filename = `${nanoid(12)}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), bytes);

    const url = `/uploads/products/${id}/${filename}`;
    const images = await addProductImage(id, url);
    return NextResponse.json({ images });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(request)) {
    return jsonError("Недопустимый источник запроса", 403);
  }

  const guard = await requireAdminSession();
  if ("error" in guard) return guard.error;

  try {
    const { id } = await params;
    const url = new URL(request.url).searchParams.get("url");
    if (!url) {
      return jsonError("Не указан url изображения", 400);
    }

    const images = await removeProductImage(id, url);

    // Best-effort file cleanup, scoped to this product's own upload
    // folder — defends against a crafted ?url= trying to unlink outside it.
    const expectedPrefix = `/uploads/products/${id}/`;
    if (url.startsWith(expectedPrefix) && !url.includes("..")) {
      await unlink(path.join(process.cwd(), "public", url)).catch(() => {});
    }

    return NextResponse.json({ images });
  } catch (error) {
    return handleApiError(error);
  }
}
