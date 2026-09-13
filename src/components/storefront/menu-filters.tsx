"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/components/locale-provider";

type Category = { slug: string; name: string };

export function MenuFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [, startTransition] = useTransition();
  const { t } = useLocale();

  const sortLabels: Record<string, string> = {
    popular: t.menu.sortPopular,
    "price-asc": t.menu.sortPriceAsc,
    "price-desc": t.menu.sortPriceDesc,
  };

  function updateParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Tabs
        value={searchParams.get("category") ?? "all"}
        onValueChange={(value) =>
          updateParams({ category: value === "all" ? undefined : value })
        }
      >
        <TabsList>
          <TabsTrigger value="all">{t.menu.categoryAll}</TabsTrigger>
          {categories.map((c) => (
            <TabsTrigger key={c.slug} value={c.slug}>
              {c.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            placeholder={t.menu.searchPlaceholder}
            className="w-48 pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParams({ search: search || undefined });
            }}
            onBlur={() => updateParams({ search: search || undefined })}
          />
        </div>
        <Select
          value={searchParams.get("sort") ?? "popular"}
          onValueChange={(value) =>
            updateParams({
              sort: !value || value === "popular" ? undefined : String(value),
            })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue>
              {(value: unknown) => sortLabels[value as string] ?? sortLabels.popular}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">{t.menu.sortPopular}</SelectItem>
            <SelectItem value="price-asc">{t.menu.sortPriceAsc}</SelectItem>
            <SelectItem value="price-desc">{t.menu.sortPriceDesc}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
