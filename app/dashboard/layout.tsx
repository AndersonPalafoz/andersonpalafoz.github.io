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
  Bell,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Início", icon: BookOpen, exact: true },
  { href: "/dashboard/cursos", label: "Cursos", icon: BookOpen },
  { href: "/dashboard/atividades", label: "Atividades", icon: CheckSquare },
  { href: "/dashboard/biblioteca", label: "Biblioteca", icon: Library },
  { href: "/dashboard/calendario", label: "Calendário", icon: Calendar },
  { href: "/dashboard/desejos", label: "Lista de Desejos", icon: Heart },
  { href: "/dashboard/notificacoes", label: "Notificações", icon: Bell },
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
    <div className="flex h-screen bg-background text-foreground">
      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative z-40 flex h-screen w-72 flex-col border-r border-border/70 bg-card/95 text-card-foreground shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-transform`}
      >
        <div className="flex items-center gap-3 border-b border-border/70 bg-gradient-to-br from-card to-red-50/60 p-5 dark:from-card dark:to-red-950/20">
          <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleAvatarChange} />
          <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading} aria-label="Alterar foto de perfil" title="Clique para alterar sua foto" className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-red-600 text-white font-semibold shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:ring-4 hover:ring-red-100 disabled:cursor-wait disabled:opacity-70">
            {avatarUrl ? <img src={avatarUrl} alt="Foto de perfil" className="h-full w-full object-cover" /> : getInitials(session?.user?.name)}
            {avatarUploading && <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[10px]">...</span>}
          </button>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{session?.user?.name || "Aluno"}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            const showWishlistBadge = item.href === "/dashboard/desejos" && wishlistCount > 0;
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                <div
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    active ? "bg-red-50 text-red-700 shadow-sm shadow-red-900/5 dark:bg-red-950/40 dark:text-red-300" : "text-muted-foreground hover:bg-muted hover:text-foreground"
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

        <div className="border-t border-border/70 p-4">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300"
          >
            <LogOut size={19} />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-border/70 bg-card/95 p-4 text-card-foreground shadow-sm backdrop-blur-xl md:hidden">
          <span className="font-bold text-foreground">Minha Área</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-xl border border-border p-2.5 text-muted-foreground transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300" aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={sidebarOpen}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <main className="flex-1 overflow-auto bg-background p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-[2px] md:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
