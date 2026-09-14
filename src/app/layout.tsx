import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/components/providers";
import { LocaleProvider } from "@/components/locale-provider";
import { getLocale, getDictionary } from "@/i18n/dictionary";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "CoffeeLab — обжарка и кофейня: зерно, эспрессо-напитки и десерты собственного производства. Закажите онлайн с доставкой или заберите в кофейне.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "CoffeeLab — специализированная кофейня",
    template: "%s · CoffeeLab",
  },
  description,
  openGraph: {
    title: "CoffeeLab — обжарка и кофейня",
    description,
    type: "website",
    locale: "ru_RU",
    siteName: "CoffeeLab",
  },
  twitter: {
    card: "summary",
    title: "CoffeeLab — обжарка и кофейня",
    description,
  },
};

export const viewport = {
  themeColor: "#4a2f1c",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <LocaleProvider locale={locale} dict={dict}>
          <Providers>
            <TooltipProvider delay={200}>
              {children}
              <Toaster richColors position="top-center" />
            </TooltipProvider>
          </Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}
