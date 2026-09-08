import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "@/components/providers";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
import "@fontsource/atkinson-hyperlegible-next/400.css";
import "@fontsource/atkinson-hyperlegible-next/600.css";
import "@fontsource/atkinson-hyperlegible-next/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@/design-system/reset.css";
import "@/design-system/tokens.css";
import "@/design-system/themes.css";
import "@/design-system/typography.css";
import "@/design-system/motion.css";
import "@/design-system/utilities.css";
import "@/design-system/components.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zedazo",
  description:
    "Ordena tus contactos. Conserva las decisiones. Procesamiento VCF local y trazable.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <Script
          id="zedazo-theme-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
