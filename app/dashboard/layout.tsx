"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BookOpen,
  CheckSquare,
  Library,
  Calendar,
  Award,
  User,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Início", icon: BookOpen, exact: true },
  { href: "/dashboard/cursos", label: "Cursos", icon: BookOpen },
  { href: "/dashboard/atividades", label: "Atividades", icon: CheckSquare },
  { href: "/dashboard/biblioteca", label: "Biblioteca", icon: Library },
  { href: "/dashboard/calendario", label: "Calendário", icon: Calendar },
  { href: "/dashboard/certificados", label: "Certificados", icon: Award },
  { href: "/dashboard/perfil", label: "Perfil", icon: User },
];

function getInitials(name?: string | null) {
  if (!name) return "?";
  const partes = name.trim().split(/\s+/);
  const primeiras = partes.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return primeiras.join("") || "?";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative w-72 h-screen bg-white border-r border-gray-200 transition-transform z-40 flex flex-col`}
      >
        {/* Usuário */}
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
            {getInitials(session?.user?.name)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {session?.user?.name || "Aluno"}
            </p>
            <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                <div
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    active
                      ? "bg-red-50 text-red-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-colors"
          >
            <LogOut size={19} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header (mobile) */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <span className="font-bold text-gray-900">Minha Área</span>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
