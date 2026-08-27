import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { canAccessProfessorPortal, getEffectiveRole, isSuperadmin } from "@/lib/role-capabilities";
import { RolePreviewProvider } from "@/components/role-preview";
import DashboardShell from "@/app/dashboard/dashboard-shell";

export default async function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  const role = session?.user?.role;
  if (!session?.user || !canAccessProfessorPortal({ email, role })) redirect("/login?callbackUrl=/professor");
  const actualRole = getEffectiveRole({ email, role });
  const canPreviewRoles = isSuperadmin({ email, role });

  return (
    <RolePreviewProvider actualRole={actualRole} enabled={canPreviewRoles}><DashboardShell initialAvatarUrl={session.user.avatarUrl || session.user.image || null}>{children}</DashboardShell></RolePreviewProvider>
  );
}
