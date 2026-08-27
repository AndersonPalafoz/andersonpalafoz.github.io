"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, BookOpen, TrendingUp, Download, FileText, ChevronLeft, Search } from "lucide-react";
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

interface DetailedReports {
  studentReports: Array<{ id: number; name: string; email: string | null; enrollments: number; completed: number; averageProgress: number; lastActivity: string | Date | null }>;
  teacherReports: Array<{ id: number; name: string; email: string | null; students: number; enrollments: number; averageProgress: number }>;
  courseReports: Array<{ id: number; title: string; level: string; enrollments: number; completed: number; averageProgress: number }>;
}

export default function AdminRelatoriosPage() {
  const { user, isLoading: authLoading, canAccessAdmin } = useAuth(true);
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [detailedReports, setDetailedReports] = useState<DetailedReports | null>(null);
  const [reportTab, setReportTab] = useState<"students" | "teachers" | "courses">("students");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user && !canAccessAdmin) {
      router.replace("/");
    }
  }, [authLoading, router, user, canAccessAdmin]);

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
    if (!authLoading && canAccessAdmin) {
      void fetchStats();
    }
  }, [authLoading, canAccessAdmin]);

  useEffect(() => {
    if (!authLoading && canAccessAdmin) {
      setDetailsLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      void fetch(`/api/admin/reports?${params.toString()}`, { cache: "no-store" }).then(async (res) => {
        if (!res.ok) throw new Error("Falha ao carregar relatórios detalhados");
        setDetailedReports(await res.json());
      }).catch(() => toast.error("Não foi possível carregar os dados detalhados dos relatórios.")).finally(() => setDetailsLoading(false));
    }
  }, [authLoading, canAccessAdmin, search]);

  const exportDetailedCSV = () => {
    if (!detailedReports) return;
    const rows = reportTab === "students" ? detailedReports.studentReports.map((item) => ["Aluno", item.name, item.email || "", item.enrollments, item.completed, `${item.averageProgress}%`]) : reportTab === "teachers" ? detailedReports.teacherReports.map((item) => ["Professor", item.name, item.email || "", item.students, item.enrollments, `${item.averageProgress}%`]) : detailedReports.courseReports.map((item) => ["Curso", item.title, item.level, item.enrollments, item.completed, `${item.averageProgress}%`]);
    const escapeCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = ["Tipo,Nome ou Curso,Email ou Nivel,Indicador 1,Indicador 2,Progresso Medio", ...rows.map((row) => row.map(escapeCell).join(","))].join("\\n");
    const blob = new Blob([`\\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-${reportTab}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório detalhado exportado com os filtros atuais.");
  };

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
      <main className="site-shell min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="page-container space-y-6" aria-busy="true" aria-label="Carregando relatórios administrativos">
          <div className="surface-card h-32 animate-pulse" />
          <div className="grid gap-6 md:grid-cols-3">
            <div className="surface-card h-28 animate-pulse" />
            <div className="surface-card h-28 animate-pulse" />
            <div className="surface-card h-28 animate-pulse" />
          </div>
          <div className="surface-card h-72 animate-pulse" />
          <p className="text-center text-sm text-muted-foreground">Carregando relatórios administrativos…</p>
        </div>
      </main>
    );
  }

  if (!user || !canAccessAdmin) return null;

  return (
    <div className="site-shell pb-12">
      <header className="border-b border-border/70 bg-card">
        <div className="page-container flex items-center justify-between gap-4 py-5">
          <div>
            <Link href="/admin" className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-red-600">
              <ChevronLeft size={16} /> Voltar ao painel
            </Link>
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">Relatórios e Estatísticas</h1>
            <p className="mt-1 text-sm text-muted-foreground">Métricas consolidadas de engajamento, matrículas e progresso dos alunos.</p>
          </div>
        </div>
      </header>

      <main className="page-container space-y-8 py-8">
        {stats && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="surface-card p-5 sm:p-6 transition-shadow hover:shadow-[0_8px_20px_rgba(0,0,0,0.10)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Total de Usuários</p>
                  <p className="text-3xl font-black text-foreground mt-2">{stats.totalUsers}</p>
                </div>
                <Users size={32} className="text-red-600" />
              </div>
            </div>
            <div className="surface-card p-5 sm:p-6 transition-shadow hover:shadow-[0_8px_20px_rgba(0,0,0,0.10)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Cursos Publicados</p>
                  <p className="text-3xl font-black text-foreground mt-2">{stats.totalCourses}</p>
                </div>
                <BookOpen size={32} className="text-red-600" />
              </div>
            </div>
            <div className="surface-card p-5 sm:p-6 transition-shadow hover:shadow-[0_8px_20px_rgba(0,0,0,0.10)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Progresso Médio</p>
                  <p className="text-3xl font-black text-foreground mt-2">{stats.averageProgress.toFixed(1)}%</p>
                </div>
                <TrendingUp size={32} className="text-red-600" />
              </div>
            </div>
          </div>
        )}

        <section className="surface-card p-5 sm:p-6 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-lg font-black text-foreground">Relatórios Acadêmicos Detalhados</h2><p className="text-sm text-muted-foreground">Acompanhamento operacional de alunos, professores e cursos.</p></div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <label className="relative block"><Search size={15} className="absolute left-3 top-3 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar aluno, professor ou curso" aria-label="Buscar nos relatórios" className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs text-foreground outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 sm:w-64" /></label>
              <Button type="button" variant="outline" onClick={exportDetailedCSV} disabled={detailsLoading || !detailedReports} className="h-10 gap-2 text-xs font-bold"><Download size={14} /> Exportar aba</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {([['students', 'Alunos'], ['teachers', 'Professores'], ['courses', 'Cursos']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={reportTab === value} onClick={() => setReportTab(value)} className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 ${reportTab === value ? 'bg-red-600 text-white' : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}>{label}</button>)}
            </div>
          </div>
          {detailsLoading ? <div className="space-y-3" aria-busy="true"><div className="h-10 animate-pulse rounded-xl bg-muted" /><div className="h-10 animate-pulse rounded-xl bg-muted" /><div className="h-10 animate-pulse rounded-xl bg-muted" /></div> : !detailedReports ? <div className="empty-state"><p>Não foi possível carregar os dados detalhados.</p></div> : reportTab === "students" ? (
            <>
              <div className="space-y-3 md:hidden" aria-live="polite">
                {detailedReports.studentReports.slice(0, 20).length === 0 ? <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nenhum aluno encontrado para os filtros atuais.</div> : detailedReports.studentReports.slice(0, 20).map((item) => <article key={item.id} className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm"><div className="min-w-0"><p className="truncate font-black text-foreground">{item.name}</p><p className="truncate text-xs text-muted-foreground" title={item.email || undefined}>{item.email || "E-mail não informado"}</p></div><dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-xl bg-muted/60 p-2"><dt className="text-[10px] font-bold uppercase text-muted-foreground">Matrículas</dt><dd className="mt-1 font-black text-foreground">{item.enrollments}</dd></div><div className="rounded-xl bg-muted/60 p-2"><dt className="text-[10px] font-bold uppercase text-muted-foreground">Concluídos</dt><dd className="mt-1 font-black text-foreground">{item.completed}</dd></div><div className="rounded-xl bg-red-50 p-2 dark:bg-red-950/25"><dt className="text-[10px] font-bold uppercase text-red-700 dark:text-red-300">Progresso</dt><dd className="mt-1 font-black text-red-700 dark:text-red-300">{item.averageProgress}%</dd></div></dl></article>)}
              </div>
              <div className="hidden overflow-x-auto md:block"><table className="data-table w-full text-left text-sm"><thead><tr className="border-b text-xs uppercase text-muted-foreground"><th className="pb-3">Aluno</th><th className="pb-3">Matrículas</th><th className="pb-3">Concluídos</th><th className="pb-3">Progresso médio</th></tr></thead><tbody>{detailedReports.studentReports.slice(0, 20).map((item) => <tr key={item.id} className="border-b border-border/70 last:border-0"><td className="py-3"><p className="font-semibold text-foreground">{item.name}</p><p className="text-xs text-muted-foreground">{item.email}</p></td><td className="py-3">{item.enrollments}</td><td className="py-3">{item.completed}</td><td className="py-3 font-bold text-red-600">{item.averageProgress}%</td></tr>)}</tbody></table></div>
            </>
          ) : reportTab === "teachers" ? (
            <>
              <div className="space-y-3 md:hidden" aria-live="polite">
                {detailedReports.teacherReports.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nenhum professor encontrado para os filtros atuais.</div> : detailedReports.teacherReports.map((item) => <article key={item.id} className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm"><div className="min-w-0"><p className="truncate font-black text-foreground">{item.name}</p><p className="truncate text-xs text-muted-foreground" title={item.email || undefined}>{item.email || "E-mail não informado"}</p></div><dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-xl bg-muted/60 p-2"><dt className="text-[10px] font-bold uppercase text-muted-foreground">Alunos</dt><dd className="mt-1 font-black text-foreground">{item.students}</dd></div><div className="rounded-xl bg-muted/60 p-2"><dt className="text-[10px] font-bold uppercase text-muted-foreground">Matrículas</dt><dd className="mt-1 font-black text-foreground">{item.enrollments}</dd></div><div className="rounded-xl bg-red-50 p-2 dark:bg-red-950/25"><dt className="text-[10px] font-bold uppercase text-red-700 dark:text-red-300">Progresso</dt><dd className="mt-1 font-black text-red-700 dark:text-red-300">{item.averageProgress}%</dd></div></dl></article>)}
              </div>
              <div className="hidden overflow-x-auto md:block"><table className="data-table w-full text-left text-sm"><thead><tr className="border-b text-xs uppercase text-muted-foreground"><th className="pb-3">Professor</th><th className="pb-3">Alunos</th><th className="pb-3">Matrículas</th><th className="pb-3">Progresso médio</th></tr></thead><tbody>{detailedReports.teacherReports.map((item) => <tr key={item.id} className="border-b border-border/70 last:border-0"><td className="py-3"><p className="font-semibold text-foreground">{item.name}</p><p className="text-xs text-muted-foreground">{item.email}</p></td><td className="py-3">{item.students}</td><td className="py-3">{item.enrollments}</td><td className="py-3 font-bold text-red-600">{item.averageProgress}%</td></tr>)}</tbody></table></div>
            </>
          ) : (
            <>
              <div className="space-y-3 md:hidden" aria-live="polite">
                {detailedReports.courseReports.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nenhum curso encontrado para os filtros atuais.</div> : detailedReports.courseReports.map((item) => <article key={item.id} className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><p className="min-w-0 break-words font-black text-foreground">{item.title}</p><span className="shrink-0 rounded-lg bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">{item.level}</span></div><dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-xl bg-muted/60 p-2"><dt className="text-[10px] font-bold uppercase text-muted-foreground">Matrículas</dt><dd className="mt-1 font-black text-foreground">{item.enrollments}</dd></div><div className="rounded-xl bg-muted/60 p-2"><dt className="text-[10px] font-bold uppercase text-muted-foreground">Conclusões</dt><dd className="mt-1 font-black text-foreground">{item.completed}</dd></div><div className="rounded-xl bg-red-50 p-2 dark:bg-red-950/25"><dt className="text-[10px] font-bold uppercase text-red-700 dark:text-red-300">Progresso</dt><dd className="mt-1 font-black text-red-700 dark:text-red-300">{item.averageProgress}%</dd></div></dl></article>)}
              </div>
              <div className="hidden overflow-x-auto md:block"><table className="data-table w-full text-left text-sm"><thead><tr className="border-b text-xs uppercase text-muted-foreground"><th className="pb-3">Curso</th><th className="pb-3">Nível</th><th className="pb-3">Matrículas</th><th className="pb-3">Conclusões</th><th className="pb-3">Progresso médio</th></tr></thead><tbody>{detailedReports.courseReports.map((item) => <tr key={item.id} className="border-b border-border/70 last:border-0"><td className="py-3 font-semibold text-foreground">{item.title}</td><td className="py-3">{item.level}</td><td className="py-3">{item.enrollments}</td><td className="py-3">{item.completed}</td><td className="py-3 font-bold text-red-600">{item.averageProgress}%</td></tr>)}</tbody></table></div>
            </>
          )}
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="surface-card p-5 sm:p-6 transition-shadow hover:shadow-[0_8px_20px_rgba(0,0,0,0.10)]">
            <h2 className="text-lg font-bold text-foreground mb-4">Relatórios Disponíveis</h2>
            <p className="text-sm text-muted-foreground">Os dados acima são carregados do banco e podem ser exportados junto com os KPIs oficiais.</p>
          </div>

          <div className="surface-card p-5 sm:p-6 transition-shadow hover:shadow-[0_8px_20px_rgba(0,0,0,0.10)]">
            <h2 className="text-lg font-bold text-foreground mb-4">Exportar Dados Oficiais</h2>
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
