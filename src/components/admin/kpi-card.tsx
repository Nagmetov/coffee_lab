import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: "success" | "info" | "warning";
}) {
  return (
    <Card className="gap-2">
      <CardHeader className="flex-row items-center justify-between pb-0">
        <CardTitle className="text-muted-foreground text-sm font-normal">
          {label}
        </CardTitle>
        <Icon
          className={cn(
            "size-4",
            accent === "success" && "text-success",
            accent === "warning" && "text-warning",
            accent === "info" && "text-primary",
            !accent && "text-muted-foreground",
          )}
          aria-hidden
        />
      </CardHeader>
      <CardContent>
        <p className="font-tabular text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
