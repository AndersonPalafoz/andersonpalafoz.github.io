import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { RolePreviewProvider } from "@/components/role-preview";
import DashboardShell from "@/app/dashboard/dashboard-shell";
import { getEffectiveRole, isSuperadmin } from "@/lib/role-capabilities";
import { canAccessAdminPortal } from "@/lib/role-capabilities";

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
  const isAuthorized = canAccessAdminPortal({ email, role });
  const actualRole = getEffectiveRole({ email, role });
  const canPreviewRoles = isSuperadmin({ email, role });

  if (!session?.user || !isAuthorized) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <RolePreviewProvider actualRole={actualRole} enabled={canPreviewRoles}><DashboardShell initialAvatarUrl={session.user.avatarUrl || session.user.image || null}>{children}</DashboardShell></RolePreviewProvider>
  );
}
