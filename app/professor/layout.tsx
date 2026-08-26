import { ProfessorMobileNav } from "@/components/professor-mobile-nav";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { canAccessProfessorPortal, getEffectiveRole, isSuperadmin } from "@/lib/role-capabilities";
import { PanelRoleContext } from "@/components/panel-role-context";
import { PanelQuickAccess } from "@/components/panel-quick-access";
import { RolePreviewProvider } from "@/components/role-preview";

export default async function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  const role = session?.user?.role;
  if (!session?.user || !canAccessProfessorPortal({ email, role })) redirect("/login?callbackUrl=/professor");
  const actualRole = getEffectiveRole({ email, role });
  const canPreviewRoles = isSuperadmin({ email, role });

  return (
    <div className="min-h-screen pb-24 text-foreground md:pb-0">
      <RolePreviewProvider actualRole={actualRole} enabled={canPreviewRoles}>
        <PanelRoleContext panel="professor" email={email} role={role} />
        <PanelQuickAccess />
        {children}
        <ProfessorMobileNav />
      </RolePreviewProvider>
    </div>
  );
}
