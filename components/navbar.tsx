"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/sobre", label: "Sobre" },
  { href: "/aulas", label: "Aulas" },
  { href: "/materiais", label: "Materiais" },
  { href: "/blog", label: "Blog" },
  { href: "/contato", label: "Contato" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">AP</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline text-white">
              Anderson Palafoz
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    Minha Área
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => signOut()}
                  className="border-gray-600 text-gray-300 hover:bg-gray-900"
                >
                  Sair
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
