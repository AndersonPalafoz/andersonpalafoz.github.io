"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageOpen,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/cursos", label: "Cursos", icon: BookOpen },
  { href: "/admin/materiais", label: "Materiais", icon: PackageOpen },
  { href: "/admin/artigos", label: "Artigos", icon: FileText },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
];

function AdminNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação administrativa" className="flex flex-col gap-1 px-3">
      {navigation.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/admin"
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            }`}
          >
            <Icon size={19} aria-hidden="true" />
            <span className="flex-1">{item.label}</span>
            {active && <ChevronRight size={16} aria-hidden="true" />}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName?: string | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-gray-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex dark:border-gray-800 dark:bg-gray-900">
        <div className="flex h-20 items-center border-b border-gray-200 px-6 dark:border-gray-800">
          <Link href="/admin" aria-label="Início do painel administrativo">
            <Image
              src="/logo-horizontal.png"
              alt="Anderson Palafoz"
              width={150}
              height={47}
              className="h-10 w-auto dark:brightness-0 dark:invert"
              priority
            />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-5">
          <p className="mb-2 px-6 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Administração
          </p>
          <AdminNavigation />
        </div>

        <div className="border-t border-gray-200 p-3 dark:border-gray-800">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            <LogOut size={19} aria-hidden="true" />
            Sair do painel
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 rounded-none bg-gray-950/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col bg-white shadow-xl dark:bg-gray-900">
            <div className="flex h-20 items-center justify-between border-b border-gray-200 px-5 dark:border-gray-800">
              <Image
                src="/logo-horizontal.png"
                alt="Anderson Palafoz"
                width={140}
                height={44}
                className="h-9 w-auto dark:brightness-0 dark:invert"
              />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar menu"
                className="p-2 text-gray-500 hover:text-gray-950 dark:hover:text-gray-100"
              >
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-5">
              <AdminNavigation onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8 dark:border-gray-800 dark:bg-gray-900/95">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
              className="p-2 text-gray-600 lg:hidden dark:text-gray-300"
            >
              <Menu size={22} />
            </button>
            <div>
              <p className="text-sm font-semibold text-gray-950 dark:text-gray-100">
                Painel administrativo
              </p>
              <p className="hidden text-xs text-gray-500 sm:block dark:text-gray-400">
                Gerencie sua plataforma educacional
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {userName || "Anderson Palafoz"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Administrador</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-full bg-red-600 text-sm font-semibold text-white">
              {(userName || "AP")
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
