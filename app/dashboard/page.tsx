
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
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bem-vindo ao seu Dashboard
          </h1>
          <p className="text-gray-600">
            Acesse seus cursos, atividades e recursos educacionais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className="p-6 rounded-lg border border-gray-200 bg-white hover:shadow-md transition cursor-pointer space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                    <Icon className="text-red-600" size={24} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {item.label}
                  </h3>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    Acessar →
                  </Button>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Seu Progresso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 mb-2">Cursos Ativos</p>
              <p className="text-3xl font-bold text-red-600">0</p>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Atividades Pendentes</p>
              <p className="text-3xl font-bold text-red-600">0</p>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Certificados Obtidos</p>
              <p className="text-3xl font-bold text-red-600">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
