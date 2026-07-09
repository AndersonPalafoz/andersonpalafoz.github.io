import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

export const metadata: Metadata = {
  title: "Admin Panel | Anderson Palafoz",
  description: "Painel administrativo para gerenciar cursos, materiais e usuários",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          backgroundColor: "#f9fafb",
          color: "#111827",
          fontFamily: "Poppins, system-ui, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
