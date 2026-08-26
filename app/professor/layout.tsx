import { ProfessorMobileNav } from "@/components/professor-mobile-nav";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { canAccessProfessorPortal } from "@/lib/role-capabilities";
import { PanelRoleContext } from "@/components/panel-role-context";
import { PanelQuickAccess } from "@/components/panel-quick-access";

export default async function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  const role = session?.user?.role;
  if (!session?.user || !canAccessProfessorPortal({ email, role })) redirect("/login?callbackUrl=/professor");

  return (
    <div className="min-h-screen pb-24 text-foreground md:pb-0">
      <PanelRoleContext panel="professor" email={email} role={role} />
      <PanelQuickAccess />
      {children}
      <ProfessorMobileNav />
    </div>
  );
}
