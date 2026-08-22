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
  GraduationCap,
  Shield,
  Sparkles,
  HelpCircle,
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
  const [showTour, setShowTour] = useState(false);
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
        // Ignorado
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

    // Verificar se é o primeiro acesso para o tour guiado
    const hasSeenTour = localStorage.getItem("dashboard_tour_seen");
    if (!hasSeenTour && (session?.user?.role === "admin" || session?.user?.role === "professor")) {
      setShowTour(true);
    }

    return () => {
      mounted = false;
      if (pulseTimer) window.clearTimeout(pulseTimer);
      window.removeEventListener("wishlist:changed", handleWishlistChange);
    };
  }, [session?.user?.role]);

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

  const closeTour = () => {
    localStorage.setItem("dashboard_tour_seen", "true");
    setShowTour(false);
  };

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href
      : pathname === href || Boolean(pathname?.startsWith(href + "/"));

  const userRole = session?.user?.role || "user";
  const roleLabel = userRole === "admin" ? "Administrador" : userRole === "professor" ? "Professor(a)" : "Estudante";
  const roleBadgeColor = userRole === "admin" ? "bg-red-600 text-white" : userRole === "professor" ? "bg-amber-500 text-white" : "bg-emerald-600 text-white";

  return (
    <div className="dashboard-frame flex h-screen bg-background text-foreground">
      {/* Tour Guiado Modal */}
      {showTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card text-card-foreground max-w-md w-full rounded-3xl p-6 border border-border shadow-2xl relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Bem-vindo(a) à Nova Minha Área!</h3>
                <p className="text-xs text-muted-foreground">Orientações de acesso docente</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Para manter o menu superior limpo e focado, os painéis exclusivos de <strong className="text-foreground">Professor</strong> e <strong className="text-foreground">Admin</strong> agora ficam centralizados no final deste menu lateral à esquerda. Você também pode alternar entre eles rapidamente usando os novos atalhos.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeTour}
                className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-red-700 transition"
              >
                Entendi, começar!
              </button>
            </div>
          </div>
        </div>
      )}

      <aside
        className={`dashboard-sidebar ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative z-40 flex h-screen w-72 flex-col border-r border-border/70 text-card-foreground shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-transform`}
      >
        <div className="flex items-center gap-3 border-b border-border/70 bg-gradient-to-br from-card to-red-50/60 p-5 dark:from-card dark:to-red-950/20">
          <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleAvatarChange} />
          <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading} aria-label="Alterar foto de perfil" title="Clique para alterar sua foto" className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-red-600 text-white font-semibold shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:ring-4 hover:ring-red-100 disabled:cursor-wait disabled:opacity-70">
            {avatarUrl ? <img src={avatarUrl} alt="Foto de perfil" className="h-full w-full object-cover" /> : getInitials(session?.user?.name)}
            {avatarUploading && <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[10px]">...</span>}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${roleBadgeColor}`}>
                {roleLabel}
              </span>
            </div>
            <p className="font-semibold text-foreground text-sm truncate">{session?.user?.name || "Aluno"}</p>
            <p className="text-[11px] text-muted-foreground truncate">{session?.user?.email}</p>
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

          {/* Seção Exclusiva de Gestão Acadêmica com Atalhos Rápidos */}
          {(session?.user?.role === "admin" || session?.user?.role === "professor") && (
            <div className="pt-4 mt-4 border-t border-border/70 space-y-2">
              <div className="flex items-center justify-between px-4">
                <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Gestão Acadêmica</p>
                <button
                  type="button"
                  onClick={() => setShowTour(true)}
                  className="text-muted-foreground hover:text-foreground transition"
                  title="Ver orientações dos painéis"
                >
                  <HelpCircle size={14} />
                </button>
              </div>

              <Link href="/professor" onClick={() => setSidebarOpen(false)}>
                <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive("/professor") ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  <GraduationCap size={19} />
                  <span className="flex-1">Painel do Professor</span>
                </div>
              </Link>

              {session?.user?.role === "admin" && (
                <>
                  <Link href="/admin" onClick={() => setSidebarOpen(false)}>
                    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive("/admin") ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                      <Shield size={19} />
                      <span className="flex-1">Painel Admin</span>
                    </div>
                  </Link>

                  {/* Atalhos Rápidos de Alternância */}
                  <div className="grid grid-cols-2 gap-2 pt-1 px-1">
                    <Link href="/professor" onClick={() => setSidebarOpen(false)} className="bg-muted/60 hover:bg-muted text-foreground text-[11px] font-bold py-1.5 px-2 rounded-lg text-center transition border border-border/60">
                      ⇄ Ir p/ Professor
                    </Link>
                    <Link href="/admin" onClick={() => setSidebarOpen(false)} className="bg-muted/60 hover:bg-muted text-foreground text-[11px] font-bold py-1.5 px-2 rounded-lg text-center transition border border-border/60">
                      ⇄ Ir p/ Admin
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
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
        <header className="dashboard-topbar flex items-center justify-between border-b border-border/70 p-4 text-card-foreground shadow-sm md:hidden">
          <span className="font-bold text-foreground">Minha Área</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-xl border border-border p-2.5 text-muted-foreground transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300" aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={sidebarOpen}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <main className="dashboard-content flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl min-w-0">{children}</div>
        </main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-[2px] md:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
