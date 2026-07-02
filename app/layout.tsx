import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
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
    title: "Anderson Palafoz | Ensino de Inglês",
    description:
      "Plataforma educacional completa para ensino de inglês com Anderson Palafoz.",
    siteName: "Anderson Palafoz Platform",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
