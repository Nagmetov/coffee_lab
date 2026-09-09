import { listCustomers } from "@/server/customer-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";

const TIER_LABELS: Record<string, string> = {
  BRONZE: "Бронза",
  SILVER: "Серебро",
  GOLD: "Золото",
  PLATINUM: "Платина",
};

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const customers = await listCustomers(search);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold">Клиенты</h2>
        <form>
          <Input
            name="search"
            placeholder="Поиск по имени или email…"
            defaultValue={search}
            className="w-64"
          />
        </form>
      </div>

      <div className="border-border rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Клиент</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Регистрация</TableHead>
              <TableHead>Заказов</TableHead>
              <TableHead>Баллы</TableHead>
              <TableHead>Уровень</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(customer.createdAt)}
                </TableCell>
                <TableCell className="font-tabular">{customer._count.orders}</TableCell>
                <TableCell className="font-tabular">{customer.loyaltyPoints}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{TIER_LABELS[customer.loyaltyTier]}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                  Клиенты не найдены
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
