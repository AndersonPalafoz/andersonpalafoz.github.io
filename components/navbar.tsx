"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { Heart, Menu, X, LogIn, LayoutDashboard, LogOut, User, Receipt, Moon, Sun, Eye, Check, Palette, Laptop } from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";
import { StreakBadge } from "@/components/streak-badge";
import { BRAND_ASSETS } from "@/lib/brand-assets";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/sobre", label: "Sobre" },
  { href: "/cursos", label: "Cursos" },
  { href: "/materiais", label: "Materiais" },
  { href: "/blog", label: "Blog" },
  { href: "/contato", label: "Contato" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistPulse, setWishlistPulse] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system" | "contrast">("system");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsOpen(false);
    setUserDropdownOpen(false);
    setThemeDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Atalho de teclado Alt+C para Alto Contraste
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        setThemeMode((prev) => {
          const next = prev === "contrast" ? "system" : "contrast";
          applyTheme(next);
          return next;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const applyTheme = (mode: "light" | "dark" | "system" | "contrast", notify = true) => {
    setThemeMode(mode);
    localStorage.setItem("themeMode", mode);

    const root = document.documentElement;
    root.classList.remove("dark", "high-contrast");

    if (mode === "contrast") {
      root.classList.add("high-contrast", "dark");
      if (notify) setToastMessage("Modo de Alto Contraste ativado (Atalho: Alt+C).");
    } else if (mode === "dark") {
      root.classList.add("dark");
      if (notify) setToastMessage("Modo Escuro ativado.");
    } else if (mode === "light") {
      if (notify) setToastMessage("Modo Claro ativado.");
    } else {
      // System
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) root.classList.add("dark");
      if (notify) setToastMessage(`Tema ajustado automaticamente para o modo ${prefersDark ? "escuro" : "claro"} (Preferência do Sistema).`);
    }

      if (!notify) return;
      const t = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(t);
  };

  useEffect(() => {
    const storedMode = localStorage.getItem("themeMode") as "light" | "dark" | "system" | "contrast" | null;
    if (storedMode) {
      applyTheme(storedMode, false);
    } else {
      applyTheme("system", false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let timer: number | undefined;
    const load = async () => {
      if (!session) { setWishlistCount(0); return; }
      try {
        const response = await fetch("/api/wishlist", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (mounted) setWishlistCount(Array.isArray(data.items) ? data.items.length : 0);
      } catch {
        // Ignorado
      }
    };
    const handleChange = (event: Event) => {
      const detail = (event as CustomEvent<{ saved?: boolean }>).detail;
      setWishlistCount((current) => Math.max(0, current + (detail?.saved ? 1 : -1)));
      setWishlistPulse(true);
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => setWishlistPulse(false), 700);
    };
    void load();
    window.addEventListener("wishlist:changed", handleChange);
    return () => {
      mounted = false;
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("wishlist:changed", handleChange);
    };
  }, [session]);

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  const linkClass = (href: string) => `relative rounded-full px-3.5 py-2 text-sm font-semibold transition-all ${isActive(href) ? "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200/60 dark:border-red-900/40" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400"}`;

  return (
    <>
      {toastMessage && (
        <aside aria-label="Notificação do sistema" className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 border border-slate-800 dark:border-slate-200">
          <Check size={16} className="text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </aside>
      )}

      <nav className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 border-b ${scrolled ? "border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-xl shadow-slate-900/[0.03] backdrop-blur-xl" : "border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-900/95 shadow-xs backdrop-blur-md"}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[4.75rem] items-center justify-between gap-4">
            <Link href="/" className="shrink-0 rounded-xl bg-white/95 dark:bg-white/95 px-2.5 py-1.5 shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-red-600 flex items-center" aria-label="Anderson Palafoz — página inicial">
              <Image src={BRAND_ASSETS.horizontal} alt="Anderson Palafoz — Professor de Inglês" width={1809} height={555} className="h-9 w-auto sm:h-10 object-contain" priority />
            </Link>

            <div className="hidden items-center gap-1.5 lg:flex">
              {navLinks.map((link) => <Link key={link.href} href={link.href} className={linkClass(link.href)}>{link.label}</Link>)}
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              {/* Dropdown de Temas (Claro, Escuro, Sistema, Alto Contraste) */}
              <div className="relative" ref={themeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 px-3.5 text-xs font-bold text-gray-700 dark:text-gray-200 transition hover:border-red-300 hover:shadow-sm"
                  aria-expanded={themeDropdownOpen}
                  aria-label="Opções de tema e acessibilidade"
                  title="Alterar tema visual"
                >
                  <Palette size={16} className="text-red-600 dark:text-red-400" />
                  <span className="capitalize">{themeMode === "contrast" ? "Alto Contraste" : themeMode}</span>
                </button>

                {themeDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 space-y-1">
                    <button
                      type="button"
                      onClick={() => { applyTheme("light"); setThemeDropdownOpen(false); }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${themeMode === "light" ? "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"}`}
                    >
                      <Sun size={15} /> Modo Claro
                    </button>
                    <button
                      type="button"
                      onClick={() => { applyTheme("dark"); setThemeDropdownOpen(false); }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${themeMode === "dark" ? "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"}`}
                    >
                      <Moon size={15} /> Modo Escuro
                    </button>
                    <button
                      type="button"
                      onClick={() => { applyTheme("system"); setThemeDropdownOpen(false); }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${themeMode === "system" ? "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"}`}
                    >
                      <Laptop size={15} /> Automático (Sistema)
                    </button>
                    <button
                      type="button"
                      onClick={() => { applyTheme("contrast"); setThemeDropdownOpen(false); }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${themeMode === "contrast" ? "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"}`}
                    >
                      <Eye size={15} /> Alto Contraste (Alt+C)
                    </button>
                  </div>
                )}
              </div>

              {session ? <>
                <Link href="/dashboard/desejos" aria-label={`Abrir Lista de Desejos${wishlistCount ? `, ${wishlistCount} cursos salvos` : ""}`} className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 transition hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 ${wishlistPulse ? "animate-pulse" : ""}`}>
                  <Heart size={17} className={wishlistCount > 0 || wishlistPulse ? "fill-red-500 text-red-500" : ""} />
                  {wishlistCount > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-black leading-5 text-white">{wishlistCount > 99 ? "99+" : wishlistCount}</span>}
                </Link>
                <NotificationBell />
                {/* Links de Professor e Admin movidos estritamente para o dashboard conforme solicitado */}
                <Link href="/dashboard" className="inline-flex h-10 items-center gap-1.5 rounded-full bg-red-600 px-4 text-xs font-black text-white shadow-sm shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700"><LayoutDashboard size={15} /> Minha área</Link>
                
                {/* Indicador de Ofensiva Diária (Streak) Dinâmico */}
                <StreakBadge />

                {/* Menu de Avatar com Dropdown */}
                <div className="relative ml-1" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 p-1 pl-2 transition hover:border-red-300 hover:shadow-sm"
                    aria-expanded={userDropdownOpen}
                  >
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 max-w-[100px] truncate">{session.user?.name || "Conta"}</span>
                    {session.user?.image ? (
                      <Image src={session.user.image} alt={session.user?.name || "Avatar"} width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xs">
                        {session.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{session.user?.name || "Usuário"}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{session.user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/dashboard/perfil" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600">
                          <User size={15} /> Meu Perfil
                        </Link>
                        <Link href="/dashboard/perfil" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600">
                          <Receipt size={15} /> Faturamento e Recibos
                        </Link>
                        <Link href="/dashboard" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600">
                          <LayoutDashboard size={15} /> Painel do Aluno
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 dark:border-slate-800 pt-1">
                        <button
                          type="button"
                          onClick={() => { setUserDropdownOpen(false); void signOut(); }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          <LogOut size={15} /> Sair da conta
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </> : <Link href="/login" className="inline-flex h-10 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-black text-white shadow-sm shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700"><LogIn size={16} /> Entrar</Link>}
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => applyTheme(themeMode === "contrast" ? "system" : "contrast")}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${themeMode === "contrast" ? "bg-amber-400 text-slate-950 border-amber-500" : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"}`}
                aria-label="Alto contraste"
              >
                <Eye size={17} />
              </button>
              <button
                type="button"
                onClick={() => applyTheme(themeMode === "dark" ? "light" : "dark")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                aria-label="Alternar tema"
              >
                {themeMode === "dark" ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
              </button>
              <button type="button" onClick={() => setIsOpen((open) => !open)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 transition hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600" aria-label={isOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={isOpen} aria-controls="mobile-navigation">
                {isOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
            </div>
          </div>

          {isOpen && <div id="mobile-navigation" className="border-t border-gray-100 dark:border-slate-800 py-4 lg:hidden bg-white dark:bg-slate-900 px-2 rounded-2xl shadow-xl my-2">
            <div className="grid gap-1">
              {navLinks.map((link) => <Link key={link.href} href={link.href} className={linkClass(link.href)} onClick={() => setIsOpen(false)}>{link.label}</Link>)}
            </div>
            <div className="mt-3 grid gap-2 border-t border-gray-100 dark:border-slate-800 pt-3">
              {session ? <>
                <Link href="/dashboard/desejos" onClick={() => setIsOpen(false)} className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-gray-800 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600"><span className="flex items-center gap-2"><Heart size={17} className={wishlistCount > 0 ? "fill-red-500 text-red-500" : ""} /> Lista de Desejos</span>{wishlistCount > 0 && <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">{wishlistCount}</span>}</Link>
                <Link href="/dashboard/perfil" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-gray-800 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600"><User size={17} /> Meu Perfil e Faturamento</Link>
                {/* Links de Professor e Admin movidos estritamente para o dashboard */}
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-xl bg-red-600 px-3 py-3 text-sm font-black text-white"><LayoutDashboard size={17} /> Minha Área</Link>
                <button type="button" onClick={() => signOut()} className="flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"><LogOut size={17} /> Sair</button>
              </> : <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-xl bg-red-600 px-3 py-3 text-sm font-black text-white"><LogIn size={17} /> Entrar</Link>}
            </div>
          </div>}
        </div>
      </nav>
    </>
  );
}
