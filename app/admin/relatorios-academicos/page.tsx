"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { redirect } from "next/navigation";
import { CheckCircle2, RefreshCw, Loader2, ArrowLeft, ShieldCheck, Database, Download, BarChart3, Eye, X } from "lucide-react";
import Link from "next/link";
import { getCourseOffers } from "@/lib/course-offer-client";
import type { CourseOffer } from "@/lib/course-offer-types";

interface ReportItem {
  id: number;
  studentName: string;
  studentEmail: string | null;
  enrolledCoursesCount: number;
  averageGrade: string;
  attendanceRate: string;
  dataSource: string;
  provenanceDetails: string;
  lastActivity: string | Date;
}

interface ReportData {
  classroomSyncStatus: {
    connected: boolean;
    lastSyncTime: string;
    sourceBadge: string;
    totalSyncedCourses: number;
    totalSyncedAssignments: number;
  };
  academicDataStatus: {
    gradesAvailable: boolean;
  };
  summary: {
    totalStudents: number;
    classroomImportedCount: number;
    localCreatedCount: number;
    averagePlatformGrade: string;
  };
  reports: ReportItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  context?: { id: number; offerName: string; academicTerm: string; courseId: number } | null;
}

interface StudentDetail {
  id: number;
  name: string;
  email: string | null;
  role: string;
  lastSignedIn: string | Date | null;
  enrolledCourses: any[];
  completedLessonsCount: number;
  totalProgressRecords: number;
  provenance: string;
}

export default function AcademicReportsPage() {
  const { user, isLoading } = useAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<"all" | "classroom" | "local">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [offerFilter, setOfferFilter] = useState("all");
  const [offers, setOffers] = useState<CourseOffer[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [syncing, setSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const params = new URLSearchParams({
        source: sourceFilter,
        status: statusFilter,
        page: page.toString(),
        ...(offerFilter !== "all" ? { offerId: offerFilter } : {}),
      });
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`/api/admin/academic-reports?${params.toString()}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `Não foi possível carregar os relatórios reais (HTTP ${res.status}).`);
      if (!json || !json.summary || !Array.isArray(json.reports)) throw new Error("A resposta dos relatórios está incompleta.");
      setData(json);
    } catch (err) {
      console.error("Error loading real academic reports:", err);
      setData(null);
      const rawMessage = err instanceof Error ? err.message : "";
      const friendlyMessage = rawMessage.includes("Failed to fetch") || rawMessage.includes("fetch")
        ? "Não foi possível conectar ao serviço de relatórios agora. Verifique sua conexão e tente novamente."
        : rawMessage || "Não foi possível carregar os relatórios acadêmicos reais. Tente novamente em alguns instantes.";
      setErrorMessage(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void getCourseOffers().then(setOffers).catch((error) => console.warn("Não foi possível carregar as ofertas para o filtro de relatórios.", error));
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== "admin") {
      redirect("/");
      return;
    }
    fetchReports();
  }, [user, isLoading, sourceFilter, statusFilter, offerFilter, startDate, endDate, page]);

  const handleOpenStudentModal = async (studentId: number) => {
    setSelectedStudentId(studentId);
    setLoadingStudent(true);
    try {
      const res = await fetch(`/api/admin/academic-reports/student?id=${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch student details");
      const json = await res.json();
      setStudentDetail(json.student);
    } catch (err) {
      console.error("Error loading student details:", err);
    } finally {
      setLoadingStudent(false);
    }
  };

  const handleSyncClassroom = async () => {
    setSyncing(true);
    setToastMessage(null);
    try {
      const res = await fetch("/api/admin/classroom-sync", { method: "POST" });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Falha ao sincronizar com o Google Classroom.");
      }

      setToastMessage({
        type: "success",
        text: `${json.message} (${json.stats.syncedCourses} turmas, ${json.stats.syncedAssignments} atividades).`,
      });
      await fetchReports();
    } catch (err: any) {
      setToastMessage({
        type: "error",
        text: err.message || "Erro ao conectar com a API do Google Classroom.",
      });
    } finally {
      setSyncing(false);
      setTimeout(() => setToastMessage(null), 6000);
    }
  };

  const handleExportCSV = () => {
    if (!data?.reports) return;
    const headers = ["Estudante", "Email", "Cursos", "Média", "Frequência", "Origem", "Detalhes"];
    const selectedOffer = offers.find((offer) => String(offer.id) === offerFilter);
    const rows = data.reports.map((r) => [
      `"${r.studentName}"`,
      `"${r.studentEmail || ""}"`,
      r.enrolledCoursesCount,
      r.averageGrade,
      `"${r.attendanceRate}"`,
      `"${r.dataSource}"`,
      `"${r.provenanceDetails}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_academico_${selectedOffer ? `oferta-${selectedOffer.id}-` : ""}${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="site-shell flex items-center justify-center px-4">
        <Loader2 className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  return (
      <div className="site-shell pb-28" aria-busy={loading}>
      {loading && <div role="status" aria-live="polite" className="mx-4 mt-4 flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-xs font-bold text-blue-700 sm:mx-auto dark:text-blue-200"><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Consultando os dados acadêmicos reais…</div>}
      {errorMessage && <div role="alert" aria-live="polite" className="mx-4 mt-4 flex max-w-7xl flex-col items-start justify-between gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700 sm:mx-auto sm:flex-row sm:items-center dark:text-red-200"><span>{errorMessage}</span><button type="button" onClick={() => void fetchReports()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-3 py-2 text-xs font-bold hover:bg-red-500/10 disabled:cursor-wait disabled:opacity-60"><Loader2 size={14} className={loading ? "animate-spin" : "hidden"} aria-hidden="true" /> {loading ? "Tentando…" : "Tentar novamente"}</button></div>}
      {data && !data.academicDataStatus.gradesAvailable && <div role="status" aria-live="polite" className="mx-4 mt-4 max-w-7xl rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-800 sm:mx-auto dark:text-amber-100">Os alunos e as matrículas foram carregados. As notas externas estão temporariamente indisponíveis, por isso a média será exibida quando a consulta for restabelecida.</div>}
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-2xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          toastMessage.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200"
            : "bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-200"
        }`}>
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
          ) : (
            <ShieldCheck className="text-red-600 shrink-0" size={20} />
          )}
          <div className="flex-1 text-xs font-bold leading-snug">{toastMessage.text}</div>
          <button onClick={() => setToastMessage(null)} className="text-muted-foreground hover:text-foreground">
            &times;
          </button>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudentId !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="surface-card w-full max-w-lg p-6 sm:p-8 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => { setSelectedStudentId(null); setStudentDetail(null); }}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-xl bg-muted/50 transition"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
              <Eye className="text-red-600" size={20} /> Detalhes Individuais do Aluno
            </h3>

            {loadingStudent ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-red-600" size={28} />
              </div>
            ) : studentDetail ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2">
                  <p className="font-black text-sm text-foreground">{studentDetail.name}</p>
                  <p className="text-muted-foreground">{studentDetail.email || "Sem email cadastrado"}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">{studentDetail.role}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">{studentDetail.provenance}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <p className="text-muted-foreground font-bold">Cursos Matriculados</p>
                    <p className="text-xl font-black text-foreground mt-1">{studentDetail.enrolledCourses.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <p className="text-muted-foreground font-bold">Aulas Concluídas</p>
                    <p className="text-xl font-black text-emerald-600 mt-1">{studentDetail.completedLessonsCount}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border space-y-2">
                  <p className="font-bold text-foreground">Último Acesso Registrado:</p>
                  <p className="text-muted-foreground">
                    {studentDetail.lastSignedIn ? new Date(studentDetail.lastSignedIn).toLocaleString() : "Nenhum login registrado recentemente"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground text-xs">Erro ao carregar os dados reais do aluno.</p>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-8 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-red-200 hover:text-white mb-2 transition">
              <ArrowLeft size={14} /> Voltar ao Painel Admin
            </Link>
            <h1 className="max-w-2xl text-2xl font-black leading-tight text-white sm:text-3xl">Relatórios Acadêmicos Reais & Classroom</h1>
            <p className="mt-2 max-w-2xl text-xs text-white/85 sm:text-sm">
              Dados 100% reais persistidos no Neon PostgreSQL e sincronizados via Google Classroom API.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-bold text-white transition border border-white/20"
            >
              <Download size={14} /> Exportar Excel (CSV)
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-3.5 py-2 text-xs font-bold text-white transition border border-white/20"
            >
              <Download size={14} /> Exportar PDF (Imprimir)
            </button>
            <button
              onClick={handleSyncClassroom}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white transition shadow-md disabled:opacity-50"
            >
              <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Sincronizando..." : "Sincronizar Classroom"}
            </button>
          </div>
        </div>
      </div>

      <div className="page-container py-8 sm:py-12 space-y-8">
        {/* Provability Banner / Classroom Audit Response */}
        <div className="surface-card p-6 border-l-4 border-l-red-600 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-base font-black text-foreground flex items-center gap-2">
              <ShieldCheck className="text-red-600" size={20} /> Auditoria de Integridade
            </h2>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${errorMessage ? "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300" : loading ? "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"}`}>
              <CheckCircle2 size={14} /> {errorMessage ? "Consulta indisponível" : loading ? "Consultando dados..." : data?.classroomSyncStatus.sourceBadge || "Dados verificados"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <strong>Compromisso contra dados falsos:</strong> Todos os registros exibidos abaixo provêm diretamente do banco relacional Neon e de chamadas ativas ao Google Workspace. Clique em qualquer aluno para abrir o modal de detalhes individuais.
          </p>
        </div>

        {/* Summary Metric Cards with Skeleton Loaders */}
        {loading && !data ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} role="presentation" className="surface-card p-5 space-y-3 animate-pulse">
                <div className="h-3 bg-muted rounded w-24" />
                <div className="h-8 bg-muted rounded w-16" />
                <div className="h-3 bg-muted rounded w-32" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="surface-card p-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total de Alunos Reais</p>
              <p className="mt-2 text-3xl font-black text-foreground">{data ? data.summary.totalStudents : "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">Contas ativas na base Neon</p>
            </div>
            <div className="surface-card p-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Importados do Classroom</p>
              <p className="mt-2 text-3xl font-black text-red-600">{data ? data.summary.classroomImportedCount : "—"}</p>
              <p className="text-xs text-red-600 font-semibold mt-1">Sincronizados via API</p>
            </div>
            <div className="surface-card p-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Criados Internamente</p>
              <p className="mt-2 text-3xl font-black text-blue-600">{data ? data.summary.localCreatedCount : "—"}</p>
              <p className="text-xs text-blue-600 font-semibold mt-1">Registrados no site</p>
            </div>
            <div className="surface-card p-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Média Real Consolidada</p>
              <p className="mt-2 text-3xl font-black text-emerald-600">{data?.academicDataStatus.gradesAvailable ? data.summary.averagePlatformGrade : "—"}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">{data?.academicDataStatus.gradesAvailable ? "Baseada em notas do sistema" : "Notas temporariamente indisponíveis"}</p>
            </div>
          </div>
        )}

        {/* Visual Summary Charts Section with Skeleton Loader */}
        <div className="surface-card p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="text-red-600" size={18} /> Resumo Gráfico de Alunos e Origens
          </h3>
          {loading && !data ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 animate-pulse">
              <div className="h-20 bg-muted rounded-xl" />
              <div className="h-20 bg-muted rounded-xl" />
            </div>
          ) : errorMessage ? (
            <div className="rounded-xl border border-dashed border-red-300 bg-red-500/5 p-5 text-sm text-red-700 dark:border-red-900/50 dark:text-red-300">O gráfico ficará disponível assim que a consulta real for concluída com sucesso.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2">
                <div className="flex justify-between text-xs font-bold text-foreground">
                  <span>Google Classroom</span>
                  <span>{data?.summary.classroomImportedCount || 0} alunos</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 transition-all duration-500"
                    style={{
                      width: `${data?.summary.totalStudents ? ((data.summary.classroomImportedCount / data.summary.totalStudents) * 100).toFixed(0) : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2">
                <div className="flex justify-between text-xs font-bold text-foreground">
                  <span>Plataforma Local</span>
                  <span>{data?.summary.localCreatedCount || 0} alunos</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{
                      width: `${data?.summary.totalStudents ? ((data.summary.localCreatedCount / data.summary.totalStudents) * 100).toFixed(0) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters and Table Section with Skeleton Loader */}
        <div className="surface-card p-6 sm:p-8 space-y-6">
          {data?.context && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">Oferta: {data.context.offerName} · {data.context.academicTerm}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label htmlFor="academic-report-offer" className="block text-xs font-bold text-muted-foreground mb-1">Oferta / Coorte</label>
              <select id="academic-report-offer" value={offerFilter} onChange={(e) => { setOfferFilter(e.target.value); setPage(1); }} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-red-600">
                <option value="all">Todas as ofertas</option>
                {offers.filter((offer) => !offer.deletedAt).map((offer) => <option key={offer.id} value={offer.id}>{offer.offerName} · {offer.academicTerm}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">Origem dos Dados</label>
              <select
                value={sourceFilter}
                onChange={(e) => { setSourceFilter(e.target.value as any); setPage(1); }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-red-600"
              >
                <option value="all">Todas as Origens</option>
                <option value="classroom">Google Classroom</option>
                <option value="local">Plataforma Local</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">Status do Aluno</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-red-600"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos (Recentes)</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">Data Inicial (Login)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-red-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">Data Final (Login)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto pt-4">
            {loading ? (
              <div className="space-y-3 py-8 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded-xl w-full" />
                ))}
              </div>
            ) : (
              <>
              <div className="space-y-3 md:hidden">
                {data?.reports.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs font-semibold text-muted-foreground">Nenhum registro encontrado para os filtros selecionados.</div>
                ) : data?.reports.map((r) => (
                  <article key={r.id} className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0"><p className="truncate font-black text-foreground">{r.studentName}</p><p className="truncate text-[11px] text-muted-foreground">{r.studentEmail}</p></div>
                      <span className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] font-bold ${r.dataSource === "Google Classroom" ? "border-red-500/20 bg-red-500/10 text-red-600" : "border-blue-500/20 bg-blue-500/10 text-blue-600"}`}>{r.dataSource}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-muted/50 p-2"><span className="block text-[10px] font-bold uppercase text-muted-foreground">Cursos</span><strong className="text-sm text-foreground">{r.enrolledCoursesCount}</strong></div>
                      <div className="rounded-xl bg-muted/50 p-2"><span className="block text-[10px] font-bold uppercase text-muted-foreground">Média</span><strong className="text-sm text-emerald-600">{r.averageGrade}</strong></div>
                      <div className="rounded-xl bg-muted/50 p-2"><span className="block text-[10px] font-bold uppercase text-muted-foreground">Frequência</span><strong className="text-sm text-foreground">{r.attendanceRate}</strong></div>
                    </div>
                    <button type="button" onClick={() => handleOpenStudentModal(r.id)} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary/20"><Eye size={14} /> Ver detalhes</button>
                  </article>
                ))}
              </div>
              <table className="hidden w-full text-left text-xs md:table">
                <thead className="bg-muted text-muted-foreground uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Estudante</th>
                    <th className="px-4 py-3">Cursos</th>
                    <th className="px-4 py-3">Média</th>
                    <th className="px-4 py-3">Frequência</th>
                    <th className="px-4 py-3">Origem</th>
                    <th className="px-4 py-3 rounded-r-xl">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data?.reports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground font-semibold">
                        Nenhum registro encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    data?.reports.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/30 transition cursor-pointer" onClick={() => handleOpenStudentModal(r.id)}>
                        <td className="px-4 py-4">
                          <p className="font-black text-foreground">{r.studentName}</p>
                          <p className="text-[11px] text-muted-foreground">{r.studentEmail}</p>
                        </td>
                        <td className="px-4 py-4 font-bold text-foreground">{r.enrolledCoursesCount} curso(s)</td>
                        <td className="px-4 py-4 font-black text-emerald-600">{r.averageGrade}</td>
                        <td className="px-4 py-4 font-bold text-foreground">{r.attendanceRate}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            r.dataSource === "Google Classroom"
                              ? "bg-red-500/10 text-red-600 border border-red-500/20"
                              : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                          }`}>
                            <Database size={12} /> {r.dataSource}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenStudentModal(r.id); }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold transition text-[11px]"
                          >
                            <Eye size={14} /> Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </>
            )}
          </div>

          {/* Pagination Controls */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Página {data.pagination.page} de {data.pagination.totalPages} (Total: {data.pagination.total} alunos)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold disabled:opacity-40 hover:bg-muted transition"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, data.pagination.totalPages))}
                  disabled={page === data.pagination.totalPages}
                  className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold disabled:opacity-40 hover:bg-muted transition"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
