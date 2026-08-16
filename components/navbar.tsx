"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Heart, Shield, GraduationCap, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/sobre", label: "Sobre" },
  { href: "/aulas", label: "Aulas" },
  { href: "/materiais", label: "Materiais" },
  { href: "/blog", label: "Blog" },
  { href: "/contato", label: "Contato" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistPulse, setWishlistPulse] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    let mounted = true;
    let timer: number | undefined;
    const load = async () => {
      if (!session) return;
      try {
        const response = await fetch("/api/wishlist", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (mounted) setWishlistCount(Array.isArray(data.items) ? data.items.length : 0);
      } catch {
        // O cabeçalho continua disponível mesmo sem a API de desejos.
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

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/logo-horizontal.png" alt="Anderson Palafoz" width={160} height={50} className="h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-red-600 font-medium transition"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex items-center gap-2.5 whitespace-nowrap">
            {session ? (
              <>
                <Link href="/dashboard/desejos" aria-label="Abrir Lista de Desejos">
                  <Button variant="outline" className={`relative border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 ${wishlistPulse ? "animate-pulse" : ""}`}>
                    <Heart size={16} className={wishlistPulse ? "fill-red-500 text-red-500" : ""} />
                    {wishlistCount > 0 && <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white">{wishlistCount > 99 ? "99+" : wishlistCount}</span>}
                  </Button>
                </Link>
                {(session.user?.role === "admin" || session.user?.role === "professor") && (
                  <Link href="/professor">
                    <Button
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 gap-1.5 text-xs sm:text-sm px-3"
                    >
                      <GraduationCap size={15} />
                      Painel do Professor
                    </Button>
                  </Link>
                )}
                {session.user?.role === "admin" && (
                  <Link href="/admin">
                    <Button
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 gap-1.5 text-xs sm:text-sm px-3"
                    >
                      <Shield size={15} />
                      Painel Admin
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm px-4">
                    Minha Área
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => signOut()}
                  className="border-red-600 text-red-600 hover:bg-red-50 text-xs sm:text-sm px-3"
                >
                  Sair
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Entrar
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-gray-700 hover:text-red-600"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden pb-4 space-y-2 border-t border-gray-200">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:text-red-600"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            {session && (
              <Link href="/dashboard/desejos" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className={`w-full justify-start text-gray-700 hover:text-red-600 gap-2 ${wishlistPulse ? "animate-pulse" : ""}`}>
                  <Heart size={16} className={wishlistCount > 0 ? "fill-red-500 text-red-500" : ""} />
                  Lista de Desejos {wishlistCount > 0 && <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">{wishlistCount}</span>}
                </Button>
              </Link>
            )}
            {(session?.user?.role === "admin" || session?.user?.role === "professor") && (
              <Link href="/professor">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:text-red-600 gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <GraduationCap size={16} />
                  Painel do Professor
                </Button>
              </Link>
            )}
            {session?.user?.role === "admin" && (
              <Link href="/admin">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:text-red-600 gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Shield size={16} />
                  Painel Admin
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
