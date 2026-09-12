import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { nextTierProgress, LOYALTY_TIER_LABELS } from "@/lib/loyalty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login?next=/profile");
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const progress = nextTierProgress(user.loyaltyPoints);
  const progressPercent = progress.pointsToNext
    ? Math.min(
        100,
        Math.round(
          (user.loyaltyPoints / (user.loyaltyPoints + progress.pointsToNext)) * 100,
        ),
      )
    : 100;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-heading mb-8 text-3xl font-semibold">Профиль</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Аккаунт</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Имя</span>
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Статус email</span>
              {user.emailVerified ? (
                <Badge variant="secondary">Подтверждён</Badge>
              ) : (
                <Badge variant="outline">Не подтверждён</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Программа лояльности</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-tabular text-2xl font-semibold">
                {user.loyaltyPoints} баллов
              </span>
              <Badge>{LOYALTY_TIER_LABELS[progress.tier]}</Badge>
            </div>
            <Progress value={progressPercent} />
            <p className="text-muted-foreground text-sm">
              {progress.pointsToNext
                ? `Ещё ${progress.pointsToNext} баллов до следующего уровня`
                : "Вы достигли максимального уровня"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
