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
  Home,
  GraduationCap,
  Shield,
  Sparkles,
  HelpCircle,
  BarChart3,
  ClipboardCheck,
  FileSignature,
  FolderKanban,
  MessageSquare,
  Settings,
  WalletCards,
  Users,
} from "lucide-react";
import { getEffectiveRole, roleLabel } from "@/lib/role-capabilities";
import { RolePreviewToolbar, useRolePreview } from "@/components/role-preview";

type NavigationItem = {
  href: string;
  label: string;
  icon: typeof BookOpen;
  exact?: boolean;
};

const studentNavItems: NavigationItem[] = [
  { href: "/dashboard", label: "Início", icon: BookOpen, exact: true },
  { href: "/dashboard/cursos", label: "Cursos", icon: BookOpen },
  { href: "/dashboard/aluno-externo", label: "Área externa", icon: GraduationCap },
  { href: "/dashboard/atividades", label: "Atividades", icon: CheckSquare },
  { href: "/dashboard/biblioteca", label: "Biblioteca", icon: Library },
  { href: "/dashboard/calendario", label: "Calendário", icon: Calendar },
  { href: "/dashboard/desejos", label: "Lista de Desejos", icon: Heart },
  { href: "/dashboard/notificacoes", label: "Notificações", icon: Bell },
  { href: "/dashboard/certificados", label: "Certificados", icon: Award },
  { href: "/dashboard/historico", label: "Histórico", icon: FileText },
  { href: "/dashboard/perfil", label: "Perfil", icon: User },
];

const teacherNavItems: NavigationItem[] = [
  { href: "/professor", label: "Visão docente", icon: GraduationCap, exact: true },
  { href: "/professor/turmas-externas", label: "Turmas externas", icon: FolderKanban },
  { href: "/professor/alunos", label: "Alunos", icon: Users },
  { href: "/professor/tarefas", label: "Tarefas", icon: ClipboardCheck },
  { href: "/professor/progresso-aulas", label: "Progresso de aulas", icon: BarChart3 },
  { href: "/professor/certificados", label: "Certificados", icon: Award },
];

const adminNavItems: NavigationItem[] = [
  { href: "/admin", label: "Visão administrativa", icon: Shield, exact: true },
  { href: "/admin/usuarios", label: "Pessoas e acessos", icon: Users },
  { href: "/admin/cursos", label: "Cursos", icon: BookOpen },
  { href: "/admin/materiais", label: "Materiais", icon: Library },
  { href: "/admin/atividades", label: "Atividades", icon: CheckSquare },
  { href: "/admin/blog", label: "Conteúdo e blog", icon: FileText },
  { href: "/admin/mensagens", label: "Mensagens", icon: MessageSquare },
  { href: "/admin/certificados", label: "Certificados", icon: FileSignature },
  { href: "/admin/relatorios-academicos", label: "Relatórios", icon: BarChart3 },
];

const superadminNavItems: NavigationItem[] = [
  { href: "/admin/cms", label: "CMS e marca", icon: Settings },
  { href: "/admin/cupons", label: "Stripe e cupons", icon: WalletCards },
  { href: "/admin/auditoria", label: "Auditoria", icon: Shield },
];

function getInitials(name?: string | null) {
  if (!name) return "?";
  const partes = name.trim().split(/\s+/);
  const primeiras = partes.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return primeiras.join("") || "?";
}

const AVATAR_CACHE_KEY_PREFIX = "dashboard_sidebar_avatar_v2";

function getAvatarCacheKey(email?: string | null) {
  const normalizedEmail = email?.trim().toLowerCase();
  return normalizedEmail
    ? `${AVATAR_CACHE_KEY_PREFIX}:${encodeURIComponent(normalizedEmail)}`
    : null;
}

function readCachedAvatarUrl(email?: string | null) {
  const cacheKey = getAvatarCacheKey(email);
  if (!cacheKey) return null;
  try {
    return window.localStorage.getItem(cacheKey);
  } catch {
    return null;
  }
}

function cacheAvatarUrl(email: string | null | undefined, url: string | null) {
  const cacheKey = getAvatarCacheKey(email);
  if (!cacheKey) return;
  try {
    if (url) window.localStorage.setItem(cacheKey, url);
    else window.localStorage.removeItem(cacheKey);
  } catch {
    // O avatar continua funcional quando o armazenamento local não está disponível.
  }
}
export default function DashboardLayout({
  children,
  initialAvatarUrl = null,
}: {
  children: React.ReactNode;
  initialAvatarUrl?: string | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistPulse, setWishlistPulse] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(!initialAvatarUrl);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { visibleRole } = useRolePreview();

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
    if (!sidebarOpen || !window.matchMedia("(max-width: 767px)").matches) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!session?.user?.email) { setAvatarLoading(false); return; }
    let active = true;
    const sessionEmail = session.user.email;
    const cachedAvatarUrl = readCachedAvatarUrl(sessionEmail);
    const immediateAvatarUrl = initialAvatarUrl || session.user?.avatarUrl || session.user?.image || cachedAvatarUrl || null;

    if (immediateAvatarUrl) {
      setAvatarUrl((current) => current || immediateAvatarUrl);
      setAvatarLoading(false);
    } else {
      setAvatarLoading(true);
    }

    fetch("/api/user/profile", { cache: "default" })
      .then(async (response) => response.ok ? response.json() : null)
      .then((payload) => {
        const profileAvatarUrl = payload?.user?.avatarUrl || null;
        if (profileAvatarUrl) cacheAvatarUrl(sessionEmail, profileAvatarUrl);
        if (active) {
          const nextUrl = profileAvatarUrl || immediateAvatarUrl;
          setAvatarUrl(profileAvatarUrl || immediateAvatarUrl);
          setAvatarLoadFailed(false);
          if (!nextUrl) setAvatarLoading(false);
        }
      })
      .catch(() => { if (active) setAvatarLoading(false); });
    return () => { active = false; };
  }, [initialAvatarUrl, session?.user?.avatarUrl, session?.user?.email, session?.user?.image]);

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
      const nextAvatarUrl = payload.user?.avatarUrl || null;
      cacheAvatarUrl(session?.user?.email, nextAvatarUrl);
      setAvatarUrl(nextAvatarUrl);
      setAvatarLoadFailed(false);
      setAvatarLoading(!payload.user?.avatarUrl);
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

  const actualRole = getEffectiveRole({ email: session?.user?.email, role: session?.user?.role });
  const canTeach = visibleRole === "professor" || visibleRole === "admin" || visibleRole === "superadmin";
  const canAdminister = visibleRole === "admin" || visibleRole === "superadmin";
  const sections = [
    { label: "Minha aprendizagem", items: studentNavItems },
    ...(canTeach ? [{ label: "Docência", items: teacherNavItems }] : []),
    ...(canAdminister ? [{ label: "Administração", items: adminNavItems }] : []),
    ...(visibleRole === "superadmin" ? [{ label: "Superadministração", items: superadminNavItems }] : []),
  ];
  const allNavItems = sections.flatMap((section) => section.items);
  const activeTitle = allNavItems.find(item => isActive(item.href, item.exact))?.label || "Minha Área";
  const roleBadgeColor = visibleRole === "superadmin" ? "bg-violet-600 text-white" : visibleRole === "admin" ? "bg-red-600 text-white" : visibleRole === "professor" ? "bg-amber-500 text-white" : "bg-emerald-600 text-white";
  const mobileNavItems = visibleRole === "superadmin" || visibleRole === "admin"
    ? [adminNavItems[0], adminNavItems[1], adminNavItems[2], adminNavItems[7], adminNavItems[8]]
    : visibleRole === "professor"
      ? [teacherNavItems[0], teacherNavItems[1], teacherNavItems[2], teacherNavItems[3], teacherNavItems[5]]
      : [studentNavItems[0], studentNavItems[1], studentNavItems[3], studentNavItems[7], studentNavItems[10]];
  const displayedAvatarUrl = !avatarLoadFailed ? (avatarUrl || session?.user?.image || null) : null;

  return (
    <div className="dashboard-frame flex min-h-[100dvh] bg-background text-foreground">
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
              A navegação agora usa uma única barra lateral. As seções de aprendizado, docência, administração e superadmin aparecem somente quando o seu papel possui acesso autorizado.
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
            id="dashboard-mobile-navigation"
            className={`dashboard-sidebar ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:sticky md:top-0 z-40 flex h-[100dvh] w-72 flex-col border-r border-border/70 text-card-foreground shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-transform`}
      >
        <div className="flex items-center gap-3 border-b border-border/70 bg-gradient-to-br from-card to-red-50/60 p-5 dark:from-card dark:to-red-950/20">
          <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleAvatarChange} />
          <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading} aria-label="Alterar foto de perfil" title="Clique para alterar sua foto" className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-red-600 text-white font-semibold shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:ring-4 hover:ring-red-100 disabled:cursor-wait disabled:opacity-70">
            {displayedAvatarUrl ? <><img src={displayedAvatarUrl} alt={`Foto de perfil de ${session?.user?.name || "usuário"}`} width={48} height={48} loading="eager" fetchPriority="high" decoding="async" className={`h-full w-full object-cover transition-opacity duration-200 ${avatarLoading ? "opacity-0" : "opacity-100"}`} onLoad={() => setAvatarLoading(false)} onError={() => { cacheAvatarUrl(session?.user?.email, null); setAvatarLoadFailed(true); setAvatarLoading(false); }} />{avatarLoading && <span aria-hidden="true" className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700" />}</> : avatarLoading ? <span aria-hidden="true" className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700" /> : <span aria-hidden="true">{getInitials(session?.user?.name)}</span>}
            {avatarUploading && <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[10px]">...</span>}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${roleBadgeColor}`}>
                {roleLabel(visibleRole)}
              </span>
            </div>
            <p className="font-semibold text-foreground text-sm truncate">{session?.user?.name || "Aluno"}</p>
            <p className="text-[11px] text-muted-foreground truncate">{session?.user?.email}</p>
          </div>
        </div>

        {actualRole === "superadmin" && <div className="border-b border-border/70 px-4 py-3"><RolePreviewToolbar /></div>}

        <nav className="flex-1 space-y-4 overflow-y-auto p-4">
          {sections.map((section) => (
            <section key={section.label} className="space-y-1.5" aria-label={section.label}>
              <div className="flex items-center justify-between px-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">{section.label}</p>
                {section.label === "Docência" && <button type="button" onClick={() => setShowTour(true)} className="text-muted-foreground transition hover:text-foreground" title="Ver orientação da navegação"><HelpCircle size={14} /></button>}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                const showWishlistBadge = item.href === "/dashboard/desejos" && wishlistCount > 0;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${active ? "bg-red-50 text-red-700 shadow-sm shadow-red-900/5 dark:bg-red-950/40 dark:text-red-300" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                      <Icon size={19} className={item.href === "/dashboard/desejos" && wishlistPulse ? "animate-pulse" : undefined} />
                      <span className="flex-1">{item.label}</span>
                      {showWishlistBadge && <span aria-label={`${wishlistCount} curso(s) salvo(s)`} className={`min-w-5 h-5 px-1.5 rounded-full bg-red-600 text-white text-[11px] font-black inline-flex items-center justify-center ${wishlistPulse ? "animate-bounce" : ""}`}>{wishlistCount > 99 ? "99+" : wishlistCount}</span>}
                    </div>
                  </Link>
                );
              })}
            </section>
          ))}
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

      <div className="flex min-w-0 flex-1 flex-col overflow-visible md:overflow-hidden">
        <header className="dashboard-panel-topbar hidden min-h-[4.75rem] items-center justify-between border-b border-border/70 px-6 py-3 text-card-foreground md:flex lg:px-8">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Área protegida</p>
            <p className="truncate text-lg font-black text-foreground">{activeTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${roleBadgeColor}`}>{roleLabel(visibleRole)}</span>
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300">
              <Home size={15} /> Ver site
            </Link>
          </div>
        </header>
        <header className="dashboard-topbar flex items-center justify-between border-b border-border/70 p-4 text-card-foreground shadow-sm md:hidden">
          <div className="min-w-0"><p className="truncate font-bold text-foreground">{activeTitle}</p><p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">{roleLabel(visibleRole)}</p></div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border p-2.5 text-muted-foreground transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300" aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={sidebarOpen} aria-controls="dashboard-mobile-navigation">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <main className="dashboard-content min-h-0 flex-1 overflow-visible p-3 pb-28 sm:p-6 sm:pb-24 md:overflow-y-auto lg:p-8 lg:pb-8">
          <div className="mx-auto min-w-0 max-w-7xl">{children}</div>
        </main>
      </div>

      <nav className="dashboard-bottom-nav fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-2xl border border-border/80 bg-card/95 p-1.5 shadow-[0_16px_45px_rgba(15,23,42,0.16)] backdrop-blur-xl md:hidden" aria-label="Navegação principal mobile">
        {mobileNavItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[9px] font-black transition ${active ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <Icon size={17} />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {sidebarOpen && <button type="button" tabIndex={-1} aria-label="Fechar menu de navegação" className="fixed inset-0 z-30 cursor-default bg-slate-950/40 backdrop-blur-[2px] md:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
