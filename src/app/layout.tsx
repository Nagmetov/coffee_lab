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

export const metadata: Metadata = {
  title: {
    default: "CoffeeLab — специализированная кофейня",
    template: "%s · CoffeeLab",
  },
  description:
    "CoffeeLab — обжарка и кофейня: зерно, эспрессо-напитки и десерты собственного производства. Закажите онлайн с доставкой или заберите в кофейне.",
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
