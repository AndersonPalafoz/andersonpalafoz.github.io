"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCheck, ChevronLeft, Download, FileText, Loader2, Users, Filter, UserX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";
import { attendanceStatusLabel, buildAttendanceCsv } from "@/lib/attendance-export";
import { filterAttendanceRecords } from "@/lib/attendance-filters";
import { buildBulkAttendancePayload } from "@/lib/attendance-bulk";

interface AttendanceRecord {
  attendanceId: number;
  studentId: number;
  sessionId: number;
  sessionTitle: string;
  scheduledAt: string;
  courseTitle: string | null;
  studentName: string | null;
  studentEmail: string | null;
  status: string;
  notes: string | null;
}

function escapeHtml(value: string | null) {
  return (value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export default function AdminChamadaPage() {
  const { user, isLoading: authLoading } = useAuth(true);
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [batchSaving, setBatchSaving] = useState<"present" | "absent" | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user && user.role !== "admin" && user.role !== "professor") router.replace("/");
  }, [authLoading, router, user]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const response = await fetch("/api/admin/attendance", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível carregar a frequência.");
      setRecords(payload.records || []);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Não foi possível carregar a frequência.";
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      const timer = window.setTimeout(() => void loadRecords(), 0);
      return () => window.clearTimeout(timer);
    }
  }, [authLoading, user]);

  const availableCourses = useMemo(() => {
    const set = new Set<string>();
    for (const r of records) {
      if (r.courseTitle) set.add(r.courseTitle);
    }
    return Array.from(set).sort();
  }, [records]);

  const visibleRecords = useMemo(() => filterAttendanceRecords(records, { status: statusFilter, courseTitle: courseFilter, startDate, endDate }), [records, statusFilter, courseFilter, startDate, endDate]);

  const presentCount = visibleRecords.filter((record) => record.status === "present").length;
  const attendanceRate = visibleRecords.length ? Math.round((presentCount / visibleRecords.length) * 100) : 0;

  const handleBulkStatus = async (status: "present" | "absent") => {
    if (!visibleRecords.length) {
      toast.error("Nenhum aluno está disponível no recorte atual.");
      return;
    }
    try {
      setBatchSaving(status);
      const response = await fetch("/api/admin/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "bulkUpdate", records: buildBulkAttendancePayload(visibleRecords, status) }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível atualizar a chamada.");
      setRecords((current) => current.map((record) => visibleRecords.some((selected) => selected.attendanceId === record.attendanceId) ? { ...record, status } : record));
      toast.success(`${payload.updated || visibleRecords.length} aluno(s) marcado(s) como ${status === "present" ? "presente(s)" : "ausente(s)"}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar a chamada.");
    } finally {
      setBatchSaving(null);
    }
  };

  const exportCSV = () => {
    const blob = new Blob([buildAttendanceCsv(visibleRecords)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_presenca_filtrado_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${visibleRecords.length} registro(s) exportado(s) em CSV com filtros aplicados.`);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Permita popups para gerar o PDF.");
      return;
    }
    const rows = visibleRecords.map((record) => `<tr><td>${escapeHtml(record.sessionTitle)}</td><td>${escapeHtml(new Date(record.scheduledAt).toLocaleString("pt-BR"))}</td><td>${escapeHtml(record.courseTitle)}</td><td>${escapeHtml(record.studentName || record.studentEmail)}</td><td>${escapeHtml(attendanceStatusLabel(record.status))}</td></tr>`).join("");
    printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Relatório de Frequência Filtrado</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#333}h1{color:#D62828;border-bottom:2px solid #D62828;padding-bottom:10px}p{font-size:13px;color:#666}table{width:100%;border-collapse:collapse;margin-top:22px}th,td{border:1px solid #ddd;padding:9px;text-align:left;font-size:12px}th{background:#f3f4f6;color:#333}.footer{margin-top:28px;border-top:1px solid #eee;padding-top:12px;font-size:11px;color:#777}</style></head><body><h1>Relatório Oficial de Frequência (Filtros Personalizados)</h1><p>Anderson Palafoz Platform · Emitido em ${escapeHtml(new Date().toLocaleString("pt-BR"))}</p><p>Taxa de presença no recorte: ${attendanceRate}% · Registros filtrados: ${visibleRecords.length}</p><table><thead><tr><th>Sessão</th><th>Data</th><th>Curso</th><th>Aluno</th><th>Status</th></tr></thead><tbody>${rows || "<tr><td colspan=5>Nenhum registro encontrado para os filtros selecionados.</td></tr>"}</tbody></table><div class="footer">Documento gerado a partir dos registros armazenados na plataforma.</div><script>window.print()</script></body></html>`);
    printWindow.document.close();
    toast.success("Relatório preparado para impressão ou salvamento em PDF.");
  };

  if (authLoading || (loading && records.length === 0 && !loadError)) return <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3"><Loader2 className="animate-spin text-red-600" size={36} /><p className="text-sm font-semibold text-muted-foreground">Carregando registros de chamada...</p></div>;
  if (!user || (user.role !== "admin" && user.role !== "professor")) return null;

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="border-b border-border bg-card text-card-foreground"><div className="mx-auto max-w-7xl px-4 py-6 sm:px-6"><Link href="/admin" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-red-600"><ChevronLeft size={16} /> Painel administrativo</Link><h1 className="text-3xl font-black tracking-tight text-foreground">Chamada e frequência</h1><p className="mt-2 text-sm text-muted-foreground">Filtre por turma, status e período antes de exportar o relatório oficial.</p></div></header>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-border bg-card text-card-foreground p-5 shadow-sm"><p className="text-xs font-bold uppercase text-muted-foreground">Registros no recorte</p><p className="mt-2 text-3xl font-black">{visibleRecords.length}</p></div><div className="rounded-2xl border border-border bg-card text-card-foreground p-5 shadow-sm"><p className="text-xs font-bold uppercase text-muted-foreground">Presentes</p><p className="mt-2 text-3xl font-black text-emerald-700">{presentCount}</p></div><div className="rounded-2xl border border-border bg-card text-card-foreground p-5 shadow-sm"><p className="text-xs font-bold uppercase text-muted-foreground">Taxa no recorte</p><p className="mt-2 text-3xl font-black text-red-600">{attendanceRate}%</p></div></section>

        <section className="rounded-2xl border border-border bg-card text-card-foreground p-5 shadow-sm sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground"><Filter size={18} className="text-red-600" /> Filtros Avançados de Exportação</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">Status de Presença</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full h-10 rounded-xl border border-border bg-card text-card-foreground px-3 text-sm">
                <option value="all">Todos os status</option>
                <option value="present">Presentes</option>
                <option value="absent">Ausentes</option>
                <option value="justified">Justificados</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">Turma / Curso</label>
              <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="w-full h-10 rounded-xl border border-border bg-card text-card-foreground px-3 text-sm">
                <option value="all">Todas as turmas</option>
                {availableCourses.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">Data Inicial</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full h-10 rounded-xl border border-border bg-card text-card-foreground px-3 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">Data Final</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full h-10 rounded-xl border border-border bg-card text-card-foreground px-3 text-sm" />
            </div>
          </div>
          {(statusFilter !== "all" || courseFilter !== "all" || startDate || endDate) && (
            <div className="flex justify-end"><button onClick={() => { setStatusFilter("all"); setCourseFilter("all"); setStartDate(""); setEndDate(""); }} className="text-xs font-bold text-red-600 hover:underline">Limpar filtros</button></div>
          )}
        </section>

        {loadError ? (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center space-y-4">
            <p className="text-base font-bold text-red-900">Falha ao carregar dados de chamada</p>
            <p className="text-sm text-red-700 max-w-md mx-auto">{loadError}</p>
            <Button onClick={() => void loadRecords()} className="bg-red-600 text-white hover:bg-red-700">Tentar novamente</Button>
          </section>
        ) : (
          <section className="rounded-2xl border border-border bg-card text-card-foreground p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600"><Users size={22} /></div><div><h2 className="text-lg font-black">Registros de presença filtrados</h2><p className="text-xs text-muted-foreground">Ações em massa aplicam-se aos alunos do recorte atual.</p></div></div><div className="flex flex-wrap gap-2"><Button onClick={() => void handleBulkStatus("present")} disabled={batchSaving !== null} variant="outline" className="h-10 gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"><CheckCheck size={16} /> {batchSaving === "present" ? "Salvando..." : "Selecionar Todos: Presentes"}</Button><Button onClick={() => void handleBulkStatus("absent")} disabled={batchSaving !== null} variant="outline" className="h-10 gap-2 border-red-200 text-red-700 hover:bg-red-50"><UserX size={16} /> {batchSaving === "absent" ? "Salvando..." : "Selecionar Todos: Ausentes"}</Button><Button onClick={exportCSV} variant="outline" className="h-10 gap-2"><Download size={16} className="text-red-600" /> Exportar CSV</Button><Button onClick={exportPDF} className="h-10 gap-2 bg-red-600 text-white hover:bg-red-700"><FileText size={16} /> Exportar PDF</Button></div></div>{visibleRecords.length === 0 ? <div className="mt-6 rounded-xl border border-dashed border-border bg-background p-12 text-center text-sm text-muted-foreground">Nenhum registro encontrado para os filtros selecionados.</div> : <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="pb-3 pr-4">Sessão</th><th className="pb-3 pr-4">Data</th><th className="pb-3 pr-4">Curso</th><th className="pb-3 pr-4">Aluno</th><th className="pb-3">Status</th></tr></thead><tbody className="divide-y divide-border/70">{visibleRecords.map((record, index) => <tr key={`${record.sessionId}-${record.studentEmail}-${index}`}><td className="py-4 pr-4 font-bold text-foreground">{record.sessionTitle}</td><td className="py-4 pr-4 text-muted-foreground">{new Date(record.scheduledAt).toLocaleString("pt-BR")}</td><td className="py-4 pr-4 text-muted-foreground">{record.courseTitle || "Sem curso"}</td><td className="py-4 pr-4"><p className="font-semibold text-foreground">{record.studentName || "Sem nome"}</p><p className="text-xs text-muted-foreground">{record.studentEmail}</p></td><td className="py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${record.status === "present" ? "bg-emerald-50 text-emerald-700" : record.status === "absent" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{attendanceStatusLabel(record.status)}</span></td></tr>)}</tbody></table></div>}</section>
        )}
      </main>
    </div>
  );
}
