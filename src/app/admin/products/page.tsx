import Link from "next/link";
import { Plus } from "lucide-react";
import { adminListProducts } from "@/server/product-service";
import { ProductActiveToggle } from "@/components/admin/product-active-toggle";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await adminListProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold">Товары</h2>
        <Button nativeButton={false} render={<Link href="/admin/products/new" />}>
          <Plus className="size-4" /> Добавить товар
        </Button>
      </div>

      <div className="border-border rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Товар</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Остаток</TableHead>
              <TableHead>Активен</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.category.name}
                  </TableCell>
                  <TableCell className="font-tabular">
                    {formatPrice(product.basePrice.toString())}
                  </TableCell>
                  <TableCell>
                    {totalStock === 0 ? (
                      <Badge
                        variant="outline"
                        className="border-destructive/40 text-destructive"
                      >
                        Нет в наличии
                      </Badge>
                    ) : (
                      <span className="font-tabular">{totalStock}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <ProductActiveToggle
                      productId={product.id}
                      isActive={product.isActive}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-primary text-sm hover:underline"
                    >
                      Изменить
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
