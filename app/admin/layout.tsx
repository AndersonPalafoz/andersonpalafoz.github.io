import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { AdminMobileNav } from "@/components/admin-mobile-nav";
import { PanelRoleContext } from "@/components/panel-role-context";
import { PanelQuickAccess } from "@/components/panel-quick-access";
import { RolePreviewProvider } from "@/components/role-preview";
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
    <div className="site-shell min-h-screen pb-24 text-foreground md:pb-0">
      <RolePreviewProvider actualRole={actualRole} enabled={canPreviewRoles}>
        <PanelRoleContext panel="admin" email={email} role={role} />
        <PanelQuickAccess />
        {children}
        <AdminMobileNav />
      </RolePreviewProvider>
    </div>
  );
}
