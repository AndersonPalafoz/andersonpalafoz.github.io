import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin Panel | Anderson Palafoz",
  description: "Painel administrativo para gerenciar cursos, materiais e usuários",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const email = session?.user?.email?.toLowerCase();
  const isAuthorized = email === "palafozanderson@gmail.com" || role === "admin" || role === "super_admin" || role === "professor";

  if (!session?.user || !isAuthorized) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="site-shell min-h-screen text-foreground">
      {children}
    </div>
  );
}
