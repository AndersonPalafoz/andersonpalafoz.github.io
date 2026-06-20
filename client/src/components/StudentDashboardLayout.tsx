import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  LogOut,
  Menu,
  User,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

interface StudentDashboardLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_ITEMS = [
  { label: "Cursos", href: "/dashboard/courses", icon: BookOpen },
  { label: "Atividades", href: "/dashboard/activities", icon: Zap },
  { label: "Biblioteca", href: "/dashboard/library", icon: BookOpen },
  { label: "Calendário", href: "/dashboard/calendar", icon: Calendar },
  { label: "Certificados", href: "/dashboard/certificates", icon: CheckCircle },
  { label: "Perfil", href: "/dashboard/profile", icon: User },
];

export default function StudentDashboardLayout({
  children,
}: StudentDashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 w-[280px] h-screen bg-card border-r border-border transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Bem-vindo, {user?.name || "Aluno"}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-30 bg-card border-b border-border p-4 flex items-center justify-between">
          <h1 className="font-bold text-foreground">Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">{children}</div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
