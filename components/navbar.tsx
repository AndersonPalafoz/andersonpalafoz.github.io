"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Heart, Shield, GraduationCap, Menu, X, LogIn, LayoutDashboard, LogOut } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/sobre", label: "Sobre" },
  { href: "/aulas", label: "Aulas" },
  { href: "/materiais", label: "Materiais" },
  { href: "/blog", label: "Blog" },
  { href: "/contato", label: "Contato" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistPulse, setWishlistPulse] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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
        // A navegação permanece disponível mesmo quando a API está indisponível.
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
  const linkClass = (href: string) => `relative rounded-full px-3 py-2 text-sm font-semibold transition-colors ${isActive(href) ? "bg-red-50 text-red-700" : "text-gray-600 hover:bg-gray-50 hover:text-red-700"}`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[4.5rem] items-center justify-between gap-4">
          <Link href="/" className="shrink-0 rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-red-600" aria-label="Anderson Palafoz — página inicial">
            <Image src="/logo-horizontal.png" alt="Anderson Palafoz" width={160} height={50} className="h-10 w-auto sm:h-11" priority />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => <Link key={link.href} href={link.href} className={linkClass(link.href)}>{link.label}</Link>)}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {session ? <>
              <Link href="/dashboard/desejos" aria-label={`Abrir Lista de Desejos${wishlistCount ? `, ${wishlistCount} cursos salvos` : ""}`} className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 ${wishlistPulse ? "animate-pulse" : ""}`}>
                <Heart size={17} className={wishlistCount > 0 || wishlistPulse ? "fill-red-500 text-red-500" : ""} />
                {wishlistCount > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-black leading-5 text-white">{wishlistCount > 99 ? "99+" : wishlistCount}</span>}
              </Link>
              {(session.user?.role === "admin" || session.user?.role === "professor") && <Link href="/professor" className="inline-flex h-10 items-center gap-1.5 rounded-full border border-gray-200 px-3 text-xs font-bold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"><GraduationCap size={15} /> Professor</Link>}
              {session.user?.role === "admin" && <Link href="/admin" className="inline-flex h-10 items-center gap-1.5 rounded-full border border-gray-200 px-3 text-xs font-bold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"><Shield size={15} /> Admin</Link>}
              <Link href="/dashboard" className="inline-flex h-10 items-center gap-1.5 rounded-full bg-red-600 px-4 text-xs font-black text-white shadow-sm shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700"><LayoutDashboard size={15} /> Minha área</Link>
              <button type="button" onClick={() => signOut()} className="inline-flex h-10 items-center gap-1.5 rounded-full border border-red-200 px-3 text-xs font-bold text-red-700 transition hover:bg-red-50"><LogOut size={15} /> Sair</button>
            </> : <Link href="/login" className="inline-flex h-10 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-black text-white shadow-sm shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700"><LogIn size={16} /> Entrar</Link>}
          </div>

          <button type="button" onClick={() => setIsOpen((open) => !open)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 lg:hidden" aria-label={isOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={isOpen} aria-controls="mobile-navigation">
            {isOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {isOpen && <div id="mobile-navigation" className="border-t border-gray-100 py-4 lg:hidden">
          <div className="grid gap-1">
            {navLinks.map((link) => <Link key={link.href} href={link.href} className={linkClass(link.href)} onClick={() => setIsOpen(false)}>{link.label}</Link>)}
          </div>
          <div className="mt-3 grid gap-2 border-t border-gray-100 pt-3">
            {session ? <>
              <Link href="/dashboard/desejos" onClick={() => setIsOpen(false)} className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-gray-700 hover:bg-red-50 hover:text-red-700"><span className="flex items-center gap-2"><Heart size={17} className={wishlistCount > 0 ? "fill-red-500 text-red-500" : ""} /> Lista de Desejos</span>{wishlistCount > 0 && <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">{wishlistCount}</span>}</Link>
              {(session.user?.role === "admin" || session.user?.role === "professor") && <Link href="/professor" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-gray-700 hover:bg-red-50 hover:text-red-700"><GraduationCap size={17} /> Painel do Professor</Link>}
              {session.user?.role === "admin" && <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-gray-700 hover:bg-red-50 hover:text-red-700"><Shield size={17} /> Painel Admin</Link>}
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-xl bg-red-600 px-3 py-3 text-sm font-black text-white"><LayoutDashboard size={17} /> Minha Área</Link>
              <button type="button" onClick={() => signOut()} className="flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-bold text-red-700 hover:bg-red-50"><LogOut size={17} /> Sair</button>
            </> : <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-xl bg-red-600 px-3 py-3 text-sm font-black text-white"><LogIn size={17} /> Entrar</Link>}
          </div>
        </div>}
      </div>
    </nav>
  );
}
