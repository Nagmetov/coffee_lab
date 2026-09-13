import { getLocale, getDictionary } from "@/i18n/dictionary";

export const metadata = { title: "О нас" };

export default async function AboutPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-heading mb-6 text-4xl font-semibold">{t.about.title}</h1>
      <div className="text-muted-foreground space-y-4 text-lg">
        {t.about.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
