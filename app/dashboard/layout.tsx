import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import DashboardShell from "./dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");
  if (session.user.approvalStatus && session.user.approvalStatus !== "approved" && session.user.role !== "admin") {
    redirect("/acesso-pendente");
  }
  if (session.user.mustChangePassword && session.user.role === "user") redirect("/primeiro-acesso");

  return <DashboardShell>{children}</DashboardShell>;
}
