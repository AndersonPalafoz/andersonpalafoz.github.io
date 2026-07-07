
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Calendar, Award, User, Activity } from "lucide-react";

export default function DashboardPage() {
  const menuItems = [
    { icon: BookOpen, label: "Meus Cursos", href: "/dashboard/cursos" },
    { icon: Activity, label: "Atividades", href: "/dashboard/atividades" },
    { icon: FileText, label: "Biblioteca", href: "/dashboard/biblioteca" },
    { icon: Calendar, label: "Calendário", href: "/dashboard/calendario" },
    { icon: Award, label: "Certificados", href: "/dashboard/certificados" },
    { icon: User, label: "Perfil", href: "/dashboard/perfil" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Bem-vindo ao seu Dashboard
          </h1>
          <p className="text-muted-foreground">
            Acesse seus cursos, atividades e recursos educacionais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className="p-6 rounded-lg border border-border bg-card hover:bg-muted transition cursor-pointer space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">
                    {item.label}
                  </h3>
                  <Button variant="ghost" size="sm">
                    Acessar →
                  </Button>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 p-6 rounded-lg border border-border bg-card">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Seu Progresso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-muted-foreground mb-2">Cursos Ativos</p>
              <p className="text-3xl font-bold text-primary">0</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">Atividades Pendentes</p>
              <p className="text-3xl font-bold text-primary">0</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">Certificados Obtidos</p>
              <p className="text-3xl font-bold text-primary">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
