"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, BookOpen, TrendingUp, Download, FileText, Loader2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";

interface AdminStats {
  totalUsers: number;
  activeStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  completedCourses: number;
  averageProgress: number;
}

export default function AdminRelatoriosPage() {
  const { user, isLoading: authLoading } = useAuth(true);
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user && user.role !== "admin") {
      router.replace("/");
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch stats");
        setStats(data);
      } catch (err) {
        toast.error("Não foi possível carregar os relatórios administrativos.");
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading && user?.role === "admin") {
      void fetchStats();
    }
  }, [authLoading, user]);

  const exportCSV = () => {
    if (!stats) return;
    const csvContent = "data:text/csv;charset=utf-8," +
      [
        "Metrica,Valor",
        `Total de Usuarios,${stats.totalUsers}`,
        `Alunos Ativos,${stats.activeStudents}`,
        `Cursos Publicados,${stats.totalCourses}`,
        `Total de Matriculas,${stats.totalEnrollments}`,
        `Cursos Concluidos,${stats.completedCourses}`,
        `Progresso Medio (%),${stats.averageProgress.toFixed(1)}`
      ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_anderson_palafoz_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Relatório CSV exportado com sucesso!");
  };

  const exportPDF = () => {
    if (!stats) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Permita popups para baixar o PDF do relatório.");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório Acadêmico - Anderson Palafoz</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #DC2626; border-bottom: 2px solid #DC2626; padding-bottom: 10px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
            .card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; background: #f9f9f9; }
            .card h3 { margin: 0; font-size: 14px; color: #666; text-transform: uppercase; }
            .card p { font-size: 28px; font-weight: bold; margin: 10px 0 0; color: #111; }
            .footer { margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #eee; pt: 10px; }
          </style>
        </head>
        <body>
          <h1>Plataforma Anderson Palafoz — Relatório Acadêmico</h1>
          <p>Emitido em: ${new Date().toLocaleString("pt-BR")}</p>
          <div class="grid">
            <div class="card"><h3>Total de Usuários</h3><p>${stats.totalUsers}</p></div>
            <div class="card"><h3>Alunos Ativos</h3><p>${stats.activeStudents}</p></div>
            <div class="card"><h3>Cursos Publicados</h3><p>${stats.totalCourses}</p></div>
            <div class="card"><h3>Matrículas Totais</h3><p>${stats.totalEnrollments}</p></div>
            <div class="card"><h3>Cursos Concluídos</h3><p>${stats.completedCourses}</p></div>
            <div class="card"><h3>Progresso Médio</h3><p>${stats.averageProgress.toFixed(1)}%</p></div>
          </div>
          <div class="footer"><p>Anderson Palafoz Platform — Ensino de Inglês e Hub Acadêmico</p></div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success("Janela de exportação em PDF gerada com sucesso!");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <Link href="/admin" className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-red-600">
              <ChevronLeft size={16} /> Voltar ao painel
            </Link>
            <h1 className="text-2xl font-black text-gray-900">Relatórios e Estatísticas</h1>
            <p className="mt-1 text-sm text-gray-500">Métricas consolidadas de engajamento, matrículas e progresso dos alunos.</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Total de Usuários</p>
                  <p className="text-3xl font-black text-gray-900 mt-2">{stats.totalUsers}</p>
                </div>
                <Users size={32} className="text-red-600" />
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Cursos Publicados</p>
                  <p className="text-3xl font-black text-gray-900 mt-2">{stats.totalCourses}</p>
                </div>
                <BookOpen size={32} className="text-red-600" />
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Progresso Médio</p>
                  <p className="text-3xl font-black text-gray-900 mt-2">{stats.averageProgress.toFixed(1)}%</p>
                </div>
                <TrendingUp size={32} className="text-red-600" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Relatórios Disponíveis</h2>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">📊 Desempenho e notas por aluno</li>
              <li className="flex items-center gap-2">📈 Progresso de aulas por curso</li>
              <li className="flex items-center gap-2">👥 Distribuição de papéis (Alunos, Professores, Admins)</li>
              <li className="flex items-center gap-2">⏱️ Taxa de frequência e chamadas online</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Exportar Dados Oficiais</h2>
            <div className="space-y-3">
              <Button onClick={exportCSV} variant="outline" className="w-full justify-start gap-2 font-semibold">
                <Download size={16} className="text-red-600" /> Exportar Dados como CSV
              </Button>
              <Button onClick={exportPDF} variant="outline" className="w-full justify-start gap-2 font-semibold">
                <FileText size={16} className="text-red-600" /> Exportar Relatório em PDF / Impressão
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
