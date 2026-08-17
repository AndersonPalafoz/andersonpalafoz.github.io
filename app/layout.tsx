import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProviderWrapper } from "@/components/session-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ToastProvider } from "@/components/toast-provider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

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
      </head>
      <body className={`${poppins.variable} ${inter.variable} bg-slate-50 font-sans text-slate-900 antialiased`}>

        <SessionProviderWrapper>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            <main className="min-h-screen bg-slate-50 pt-[4.5rem]">{children}</main>
            <Footer />
            <ToastProvider />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
