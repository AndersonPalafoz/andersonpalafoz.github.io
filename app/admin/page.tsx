"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, BookOpen, FileText, Users, Loader } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

interface Stats {
  totalCourses: number;
  totalMaterials: number;
  totalArticles: number;
  totalUsers: number;
  totalEnrollments: number;
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!user || user.role !== "admin") {
      redirect("/");
    }

    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, isLoading]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Voltar para Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-red-600 text-white px-6 py-8">
        <h1 className="text-3xl font-bold">Painel Admin</h1>
        <p className="text-red-100 mt-2">Gerenciar cursos, materiais e usuários</p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Cursos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalCourses || 0}
                </p>
              </div>
              <BookOpen className="text-red-600" size={32} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Materiais</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalMaterials || 0}
                </p>
              </div>
              <FileText className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Usuários Ativos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalUsers || 0}
                </p>
              </div>
              <Users className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Inscrições</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.totalEnrollments || 0}
                </p>
              </div>
              <BarChart3 className="text-purple-600" size={32} />
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/cursos">
            <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <BookOpen className="text-red-600 mb-4" size={40} />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Gerenciar Cursos</h2>
              <p className="text-gray-600">Criar, editar e deletar cursos</p>
            </div>
          </Link>

          <Link href="/admin/materiais">
            <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <FileText className="text-blue-600 mb-4" size={40} />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Gerenciar Materiais</h2>
              <p className="text-gray-600">Adicionar e organizar materiais de apoio</p>
            </div>
          </Link>

          <Link href="/admin/artigos">
            <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <FileText className="text-green-600 mb-4" size={40} />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Gerenciar Artigos</h2>
              <p className="text-gray-600">Publicar e editar artigos do blog</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
