import Link from "next/link";
import { Star } from "lucide-react";
import { adminListReviews } from "@/server/product-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReviewActions } from "@/components/admin/review-actions";
import { formatDate } from "@/lib/format";

export default async function AdminReviewsPage() {
  const reviews = await adminListReviews();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold">Отзывы</h2>
        <p className="text-muted-foreground text-sm">
          Скрытые отзывы не показываются на сайте и не влияют на рейтинг товара
        </p>
      </div>

      <div className="border-border rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Товар</TableHead>
              <TableHead>Автор</TableHead>
              <TableHead>Оценка</TableHead>
              <TableHead>Отзыв</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium">
                  <Link href={`/products/${review.product.slug}`} className="hover:underline">
                    {review.product.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {review.user.name}
                  <div className="text-xs">{review.user.email}</div>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1">
                    <Star className="fill-warning text-warning size-3.5" aria-hidden />
                    {review.rating}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate">
                  {review.comment}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(review.createdAt)}
                </TableCell>
                <TableCell>
                  {review.isHidden ? (
                    <Badge variant="outline" className="text-muted-foreground">
                      Скрыт
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Виден</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <ReviewActions reviewId={review.id} isHidden={review.isHidden} />
                </TableCell>
              </TableRow>
            ))}
            {reviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                  Отзывов пока нет
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
