
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart3, Users, BookOpen, TrendingUp } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  completedCourses: number;
  averageProgress: number;
}

export default function RelatoriosPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/stats");

      if (!response.ok) {
        throw new Error("Falha ao carregar estatisticas");
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Relatorios e Estatisticas
          </h1>
          <p className="text-gray-600">
            Acompanhe o desempenho da plataforma e dos alunos
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-600 py-12">
            Carregando estatisticas...
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-12">
            Erro: {error}
          </div>
        ) : stats ? (
          <>
            {/* Cards de Estatisticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total de Usuarios</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">
                      {stats.totalUsers}
                    </p>
                  </div>
                  <Users size={32} className="text-blue-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Total de Cursos</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">
                      {stats.totalCourses}
                    </p>
                  </div>
                  <BookOpen size={32} className="text-green-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Inscricoes Ativas</p>
                    <p className="text-3xl font-bold text-purple-900 mt-2">
                      {stats.totalEnrollments}
                    </p>
                  </div>
                  <TrendingUp size={32} className="text-purple-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Cursos Concluidos</p>
                    <p className="text-3xl font-bold text-orange-900 mt-2">
                      {stats.completedCourses}
                    </p>
                  </div>
                  <BarChart3 size={32} className="text-orange-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Progresso Medio</p>
                    <p className="text-3xl font-bold text-red-900 mt-2">
                      {stats.averageProgress.toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp size={32} className="text-red-400" />
                </div>
              </div>
            </div>

            {/* Secoes de Relatorios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Relatorios Disponiveis
                </h2>
                <ul className="space-y-2">
                  <li className="text-gray-600">📊 Desempenho por Aluno</li>
                  <li className="text-gray-600">📈 Progresso por Curso</li>
                  <li className="text-gray-600">👥 Distribuicao de Usuarios</li>
                  <li className="text-gray-600">⏱️ Tempo Medio de Conclusao</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Exportar Dados
                </h2>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    📥 Exportar como CSV
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    📄 Exportar como PDF
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {/* Link para voltar */}
        <div className="mt-8">
          <Link href="/admin">
            <Button variant="outline">Voltar para Admin</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
