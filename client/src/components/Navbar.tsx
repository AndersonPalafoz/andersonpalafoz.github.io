import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { NAVIGATION_LINKS } from "@/constants";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 navbar-blur border-b border-border">
      <div className="container h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/manus-storage/logo-horizontal_cab10f57.png"
            alt="Anderson Palafoz"
            className="h-12 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {NAVIGATION_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Button - Always Visible */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-sm"
            >
              Sair
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              className="text-sm bg-primary hover:bg-primary-hover text-white"
            >
              <a href={getLoginUrl()}>Entrar</a>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-4 space-y-3">
            {NAVIGATION_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
