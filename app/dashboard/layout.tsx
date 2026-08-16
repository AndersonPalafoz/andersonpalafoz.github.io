"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  BookOpen,
  CheckSquare,
  Library,
  Calendar,
  Award,
  FileText,
  User,
  Menu,
  X,
  LogOut,
  Heart,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Início", icon: BookOpen, exact: true },
  { href: "/dashboard/cursos", label: "Cursos", icon: BookOpen },
  { href: "/dashboard/atividades", label: "Atividades", icon: CheckSquare },
  { href: "/dashboard/biblioteca", label: "Biblioteca", icon: Library },
  { href: "/dashboard/calendario", label: "Calendário", icon: Calendar },
  { href: "/dashboard/desejos", label: "Lista de Desejos", icon: Heart },
  { href: "/dashboard/certificados", label: "Certificados", icon: Award },
  { href: "/dashboard/historico", label: "Histórico", icon: FileText },
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
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistPulse, setWishlistPulse] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    let mounted = true;
    let pulseTimer: number | undefined;

    const loadWishlistCount = async () => {
      try {
        const response = await fetch("/api/wishlist", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (mounted) setWishlistCount(Array.isArray(data.items) ? data.items.length : 0);
      } catch {
        // A navegação continua funcional mesmo quando a API de desejos estiver indisponível.
      }
    };

    const handleWishlistChange = (event: Event) => {
      const detail = (event as CustomEvent<{ saved?: boolean }>).detail;
      setWishlistCount((current) => Math.max(0, current + (detail?.saved ? 1 : -1)));
      setWishlistPulse(true);
      if (pulseTimer) window.clearTimeout(pulseTimer);
      pulseTimer = window.setTimeout(() => setWishlistPulse(false), 700);
    };

    void loadWishlistCount();
    window.addEventListener("wishlist:changed", handleWishlistChange);
    return () => {
      mounted = false;
      if (pulseTimer) window.clearTimeout(pulseTimer);
      window.removeEventListener("wishlist:changed", handleWishlistChange);
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.email) return;
    let active = true;
    fetch("/api/user/profile", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : null)
      .then((payload) => { if (active) setAvatarUrl(payload?.user?.avatarUrl || null); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [session?.user?.email]);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setAvatarUploading(true);
    try {
      const response = await fetch("/api/user/profile", { method: "PUT", body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível atualizar a foto.");
      setAvatarUrl(payload.user?.avatarUrl || null);
      toast.success("Foto de perfil atualizada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar a foto.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href
      : pathname === href || Boolean(pathname?.startsWith(href + "/"));

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative w-72 h-screen bg-white border-r border-gray-200 transition-transform z-40 flex flex-col`}
      >
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleAvatarChange} />
          <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading} aria-label="Alterar foto de perfil" title="Clique para alterar sua foto" className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-red-600 text-white font-semibold transition hover:ring-4 hover:ring-red-100 disabled:cursor-wait disabled:opacity-70">
            {avatarUrl ? <img src={avatarUrl} alt="Foto de perfil" className="h-full w-full object-cover" /> : getInitials(session?.user?.name)}
            {avatarUploading && <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[10px]">...</span>}
          </button>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{session?.user?.name || "Aluno"}</p>
            <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            const showWishlistBadge = item.href === "/dashboard/desejos" && wishlistCount > 0;
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                <div
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    active ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon size={19} className={item.href === "/dashboard/desejos" && wishlistPulse ? "animate-pulse" : undefined} />
                  <span className="flex-1">{item.label}</span>
                  {showWishlistBadge && (
                    <span
                      aria-label={`${wishlistCount} curso(s) salvo(s)`}
                      className={`min-w-5 h-5 px-1.5 rounded-full bg-red-600 text-white text-[11px] font-black inline-flex items-center justify-center ${wishlistPulse ? "animate-bounce" : ""}`}
                    >
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <span className="font-bold text-gray-900">Minha Área</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Abrir menu">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 md:hidden z-30" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
