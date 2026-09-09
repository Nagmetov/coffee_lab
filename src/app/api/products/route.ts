import { NextResponse } from "next/server";
import { listProducts } from "@/server/product-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") ?? undefined;
  const search = url.searchParams.get("search") ?? undefined;
  const sortParam = url.searchParams.get("sort");
  const sort =
    sortParam === "price-asc" || sortParam === "price-desc" ? sortParam : "popular";

  const products = await listProducts({ categorySlug: category, search, sort });
  return NextResponse.json({ products });
}
