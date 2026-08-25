"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, FileSignature, Globe, LayoutDashboard, Users, CalendarDays, Mic2 } from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "Início", icon: LayoutDashboard, exact: true },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/cursos", label: "Cursos", icon: BookOpen },
  { href: "/admin/cms", label: "Conteúdo", icon: Globe },
  { href: "/admin/certificados", label: "Certificados", icon: FileSignature },
  { href: "/admin/relatorios-academicos", label: "Relatórios", icon: BarChart3 },
  { href: "/professor/turmas-externas", label: "Turmas", icon: CalendarDays },
  { href: "/professor/progresso-aulas", label: "Speaking", icon: Mic2 },
];

export function AdminMobileNav() {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="admin-mobile-nav fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 gap-1 sm:grid-cols-8 rounded-2xl border border-border/80 bg-card/95 p-1.5 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl md:hidden" aria-label="Navegação administrativa mobile">
      {adminNavItems.map(item => {
        const Icon = item.icon;
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[9px] font-black transition active:scale-95 ${active ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <Icon size={16} aria-hidden="true" />
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
