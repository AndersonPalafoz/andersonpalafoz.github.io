"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, BookOpen, CheckSquare, GraduationCap, LayoutDashboard, Mic2, Users } from "lucide-react";

const teacherNavItems = [
  { href: "/professor", label: "Início", icon: LayoutDashboard, exact: true },
  { href: "/professor/turmas-externas", label: "Turmas", icon: BookOpen },
  { href: "/professor/alunos", label: "Alunos", icon: Users },
  { href: "/professor/tarefas", label: "Tarefas", icon: CheckSquare },
  { href: "/professor/progresso-aulas", label: "Speaking", icon: Mic2 },
  { href: "/professor/certificados", label: "Certificados", icon: Award },
];

export function ProfessorMobileNav() {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-6 gap-1 rounded-2xl border border-border/80 bg-card/95 p-1.5 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur-xl md:hidden" aria-label="Navegação do professor mobile">
      {teacherNavItems.map(item => {
        const Icon = item.icon;
        const active = isActive(item.href, item.exact);
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[9px] font-black transition active:scale-95 ${active ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <Icon size={16} aria-hidden="true" />
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
