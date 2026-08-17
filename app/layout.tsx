import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProviderWrapper } from "@/components/session-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ToastProvider } from "@/components/toast-provider";
import { InactivityMonitor } from "@/components/inactivity-monitor";
import type { Metadata } from "next";

export const metadata: Metadata = {
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 font-sans text-slate-900 antialiased">
        <SessionProviderWrapper>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            <main className="min-h-screen bg-slate-50 pt-[4.5rem]">{children}</main>
            <Footer />
            <ToastProvider />
            <InactivityMonitor />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
