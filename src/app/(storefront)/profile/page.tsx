import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { nextTierProgress } from "@/lib/loyalty";
import { getLocale, getDictionary } from "@/i18n/dictionary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login?next=/profile");
  }

  const [user, locale] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.sub } }),
    getLocale(),
  ]);
  if (!user) {
    redirect("/auth/login?next=/profile");
  }
  const t = getDictionary(locale);

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
      <h1 className="font-heading mb-8 text-3xl font-semibold">{t.profile.title}</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.profile.accountTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.profile.name}</span>
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.profile.email}</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.profile.emailStatus}</span>
              {user.emailVerified ? (
                <Badge variant="secondary">{t.profile.verified}</Badge>
              ) : (
                <Badge variant="outline">{t.profile.notVerified}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.profile.loyaltyTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-tabular text-2xl font-semibold">
                {user.loyaltyPoints} {t.profile.pointsSuffix}
              </span>
              <Badge>{t.profile.tiers[progress.tier]}</Badge>
            </div>
            <Progress value={progressPercent} />
            <p className="text-muted-foreground text-sm">
              {progress.pointsToNext
                ? `${t.profile.pointsToNextPrefix} ${progress.pointsToNext} ${t.profile.pointsToNextSuffix}`.trim()
                : t.profile.maxTierReached}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
