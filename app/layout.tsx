import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProviderWrapper } from "@/components/session-provider";
import { ToastProvider } from "@/components/toast-provider";
import { InactivityMonitor } from "@/components/inactivity-monitor";
import { SiteFrame } from "@/components/site-frame";
import type { Metadata } from "next";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import { Inter, Poppins } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://andersonpalafoz.vercel.app"),
  title: "Anderson Palafoz | Ensino de Inglês",
  description:
    "Plataforma educacional completa para ensino de inglês com Anderson Palafoz. Cursos, materiais, blog e muito mais.",
  keywords: [
    "inglês",
    "ensino",
    "cursos",
    "materiais",
    "educação",
    "Anderson Palafoz",
  ],
  authors: [{ name: "Anderson Palafoz" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://andersonpalafoz.com",
    siteName: "Anderson Palafoz Platform",
    images: [{ url: BRAND_ASSETS.horizontal, width: 1809, height: 555, alt: "Anderson Palafoz — Professor de Inglês" }],
  },
  icons: {
    icon: [
      { url: BRAND_ASSETS.faviconLight, type: "image/png", sizes: "1260x1254" },
      { url: BRAND_ASSETS.faviconDark, type: "image/png", sizes: "1260x1254", media: "(prefers-color-scheme: dark)" },
    ],
    apple: [{ url: BRAND_ASSETS.faviconLight, type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={BRAND_ASSETS.faviconLight} type="image/png" />
        <link rel="alternate icon" href={BRAND_ASSETS.faviconDark} type="image/png" media="(prefers-color-scheme: dark)" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const mode = localStorage.getItem("themeMode");
                const root = document.documentElement;
                root.classList.remove("dark", "high-contrast");
                if (mode === "contrast") {
                  root.classList.add("high-contrast", "dark");
                } else if (mode === "dark") {
                  root.classList.add("dark");
                } else if (mode === "light") {
                  // O estado limpo representa o modo claro.
                } else if (mode === "system" || (!mode && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                    root.classList.add("dark");
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${poppins.variable} ${inter.variable} site-shell font-sans text-slate-900 antialiased`}>
        <SessionProviderWrapper>
          <ThemeProvider>
            <SiteFrame>{children}</SiteFrame>
            <ToastProvider />
            <InactivityMonitor />
            <SpeedInsights
              sampleRate={0.5}
              beforeSend={(event) => {
                const pathname = new URL(event.url, "https://andersonpalafoz.com.br").pathname;
                const isPrivateRoute =
                  pathname.startsWith("/admin") ||
                  pathname.startsWith("/api") ||
                  pathname.startsWith("/dashboard") ||
                  pathname.startsWith("/professor") ||
                  pathname.startsWith("/aluno") ||
                  pathname.startsWith("/login") ||
                  pathname.startsWith("/cadastro") ||
                  pathname.startsWith("/primeiro-acesso") ||
                  pathname.startsWith("/redefinir-senha");
                return isPrivateRoute ? null : event;
              }}
            />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
