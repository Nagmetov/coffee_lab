import { listPromotions } from "@/server/promotion-service";
import { PromotionFormDialog } from "@/components/admin/promotion-form-dialog";
import { PromotionActiveToggle } from "@/components/admin/promotion-active-toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatPrice } from "@/lib/format";

export default async function AdminPromotionsPage() {
  const promotions = await listPromotions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold">Промокоды</h2>
        <PromotionFormDialog />
      </div>

      <div className="border-border rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Код</TableHead>
              <TableHead>Скидка</TableHead>
              <TableHead>Мин. сумма</TableHead>
              <TableHead>Использовано</TableHead>
              <TableHead>Период</TableHead>
              <TableHead>Активен</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell className="font-medium">{promo.code}</TableCell>
                <TableCell>
                  {promo.type === "PERCENT"
                    ? `${promo.value}%`
                    : formatPrice(promo.value.toString())}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatPrice(promo.minOrderAmount.toString())}
                </TableCell>
                <TableCell className="font-tabular">
                  {promo.usedCount}
                  {promo.usageLimit ? ` / ${promo.usageLimit}` : ""}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(promo.validFrom)} – {formatDate(promo.validTo)}
                </TableCell>
                <TableCell>
                  <PromotionActiveToggle
                    promotionId={promo.id}
                    isActive={promo.isActive}
                  />
                </TableCell>
              </TableRow>
            ))}
            {promotions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                  Промокодов пока нет
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
