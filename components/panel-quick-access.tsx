"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, BriefcaseBusiness, FileSignature, GraduationCap, LayoutDashboard, Settings2, Users, WalletCards } from "lucide-react";
import { RolePreviewToolbar, useRolePreview } from "@/components/role-preview";

type QuickAccessItem = { href: string; label: string; icon: typeof LayoutDashboard; superadminOnly?: boolean };

const baseItems: QuickAccessItem[] = [
  { href: "/admin", label: "Admin", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Pessoas", icon: Users },
  { href: "/admin/cursos", label: "Cursos", icon: BookOpen },
  { href: "/admin/certificados", label: "Certificados", icon: FileSignature },
  { href: "/admin/relatorios-academicos", label: "Relatórios", icon: BarChart3 },
  { href: "/professor", label: "Docência", icon: GraduationCap },
  { href: "/professor/turmas-externas", label: "Turmas", icon: BriefcaseBusiness },
  { href: "/admin/cms", label: "CMS", icon: Settings2, superadminOnly: true },
  { href: "/admin/cupons", label: "Stripe", icon: WalletCards, superadminOnly: true },
];

export function PanelQuickAccess() {
  const pathname = usePathname();
  const { visibleRole } = useRolePreview();
  const admin = visibleRole === "admin" || visibleRole === "superadmin";
  const professor = visibleRole === "professor" || admin;
  const superadmin = visibleRole === "superadmin";

  const items = baseItems.filter((item) => {
    if (item.superadminOnly) return superadmin;
    if (item.href.startsWith("/admin")) return admin;
    return professor;
  });

  if (items.length < 2) return null;

  return (
    <nav className="site-shell border-b border-border/70 bg-card/80" aria-label="Atalhos entre áreas autorizadas">
      <div className="page-container flex gap-2 overflow-x-auto py-2.5 [scrollbar-width:none]">
        <RolePreviewToolbar />
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/admin" && item.href !== "/professor" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition active:scale-[0.98] ${active ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/35 dark:text-red-200" : "border-border bg-background text-muted-foreground hover:border-red-200 hover:text-red-700 dark:hover:border-red-900/60 dark:hover:text-red-200"}`}
            >
              <Icon size={15} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
