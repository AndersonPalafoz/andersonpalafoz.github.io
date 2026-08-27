import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import DashboardShell from "./dashboard-shell";
import { RolePreviewProvider } from "@/components/role-preview";
import { getEffectiveRole, isSuperadmin } from "@/lib/role-capabilities";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");
  if (session.user.approvalStatus && session.user.approvalStatus !== "approved" && session.user.role !== "admin") {
    redirect("/acesso-pendente");
  }
  if (session.user.mustChangePassword && session.user.role === "user") redirect("/primeiro-acesso");
  const email = session.user.email?.toLowerCase();
  const actualRole = getEffectiveRole({ email, role: session.user.role });

  return <RolePreviewProvider actualRole={actualRole} enabled={isSuperadmin({ email, role: session.user.role })}><DashboardShell initialAvatarUrl={session.user.avatarUrl || session.user.image || null}>{children}</DashboardShell></RolePreviewProvider>;
}
