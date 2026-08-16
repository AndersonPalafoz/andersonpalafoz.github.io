"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Download, FileText, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";
import { attendanceStatusLabel, buildAttendanceCsv } from "@/lib/attendance-export";

interface AttendanceRecord {
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
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && user && user.role !== "admin" && user.role !== "professor") router.replace("/");
  }, [authLoading, router, user]);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const response = await fetch("/api/admin/attendance", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Não foi possível carregar a frequência.");
        setRecords(payload.records || []);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Não foi possível carregar a frequência.");
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading && user) void loadRecords();
  }, [authLoading, user]);

  const visibleRecords = useMemo(() => filter === "all" ? records : records.filter((record) => record.status === filter), [filter, records]);
  const presentCount = records.filter((record) => record.status === "present").length;
  const attendanceRate = records.length ? Math.round((presentCount / records.length) * 100) : 0;

  const exportCSV = () => {
    const blob = new Blob([buildAttendanceCsv(visibleRecords)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_presenca_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${visibleRecords.length} registro(s) exportado(s) em CSV.`);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Permita popups para gerar o PDF.");
      return;
    }
    const rows = visibleRecords.map((record) => `<tr><td>${escapeHtml(record.sessionTitle)}</td><td>${escapeHtml(new Date(record.scheduledAt).toLocaleString("pt-BR"))}</td><td>${escapeHtml(record.courseTitle)}</td><td>${escapeHtml(record.studentName || record.studentEmail)}</td><td>${escapeHtml(attendanceStatusLabel(record.status))}</td></tr>`).join("");
    printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Relatório de Presença</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#333}h1{color:#D62828;border-bottom:2px solid #D62828;padding-bottom:10px}p{font-size:13px;color:#666}table{width:100%;border-collapse:collapse;margin-top:22px}th,td{border:1px solid #ddd;padding:9px;text-align:left;font-size:12px}th{background:#f3f4f6;color:#333}.footer{margin-top:28px;border-top:1px solid #eee;padding-top:12px;font-size:11px;color:#777}</style></head><body><h1>Relatório Oficial de Frequência</h1><p>Anderson Palafoz Platform · Emitido em ${escapeHtml(new Date().toLocaleString("pt-BR"))}</p><p>Taxa de presença no recorte: ${attendanceRate}% · Registros: ${visibleRecords.length}</p><table><thead><tr><th>Sessão</th><th>Data</th><th>Curso</th><th>Aluno</th><th>Status</th></tr></thead><tbody>${rows || "<tr><td colspan=5>Nenhum registro encontrado.</td></tr>"}</tbody></table><div class="footer">Documento gerado a partir dos registros armazenados na plataforma.</div><script>window.print()</script></body></html>`);
    printWindow.document.close();
    toast.success("Relatório preparado para impressão ou salvamento em PDF.");
  };

  if (authLoading || loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-red-600" size={32} /></div>;
  if (!user || (user.role !== "admin" && user.role !== "professor")) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="border-b border-gray-200 bg-white"><div className="mx-auto max-w-7xl px-4 py-6 sm:px-6"><Link href="/admin" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-red-600"><ChevronLeft size={16} /> Painel administrativo</Link><h1 className="text-3xl font-black tracking-tight text-gray-950">Chamada e frequência</h1><p className="mt-2 text-sm text-gray-500">Exporte o recorte atual para compartilhar, arquivar ou analisar em uma planilha.</p></div></header>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase text-gray-500">Registros no recorte</p><p className="mt-2 text-3xl font-black">{visibleRecords.length}</p></div><div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase text-gray-500">Presentes</p><p className="mt-2 text-3xl font-black text-emerald-700">{presentCount}</p></div><div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase text-gray-500">Taxa geral</p><p className="mt-2 text-3xl font-black text-red-600">{attendanceRate}%</p></div></section>
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600"><Users size={22} /></div><div><h2 className="text-lg font-black">Relatório de presença</h2><p className="text-xs text-gray-500">Os dados abaixo vêm diretamente das chamadas registradas.</p></div></div><div className="flex flex-col gap-2 sm:flex-row"><select value={filter} onChange={(event) => setFilter(event.target.value)} className="h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm"><option value="all">Todos os status</option><option value="present">Presentes</option><option value="absent">Ausentes</option><option value="justified">Justificados</option></select><Button onClick={exportCSV} variant="outline" className="h-11 gap-2"><Download size={16} className="text-red-600" /> CSV</Button><Button onClick={exportPDF} className="h-11 gap-2 bg-red-600 text-white hover:bg-red-700"><FileText size={16} /> PDF</Button></div></div>{visibleRecords.length === 0 ? <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center text-sm text-gray-500">Nenhum registro de presença foi encontrado.</div> : <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500"><tr><th className="pb-3 pr-4">Sessão</th><th className="pb-3 pr-4">Data</th><th className="pb-3 pr-4">Curso</th><th className="pb-3 pr-4">Aluno</th><th className="pb-3">Status</th></tr></thead><tbody className="divide-y divide-gray-100">{visibleRecords.map((record, index) => <tr key={`${record.sessionId}-${record.studentEmail}-${index}`}><td className="py-4 pr-4 font-bold text-gray-900">{record.sessionTitle}</td><td className="py-4 pr-4 text-gray-600">{new Date(record.scheduledAt).toLocaleString("pt-BR")}</td><td className="py-4 pr-4 text-gray-600">{record.courseTitle || "Sem curso"}</td><td className="py-4 pr-4"><p className="font-semibold text-gray-900">{record.studentName || "Sem nome"}</p><p className="text-xs text-gray-500">{record.studentEmail}</p></td><td className="py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${record.status === "present" ? "bg-emerald-50 text-emerald-700" : record.status === "absent" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{attendanceStatusLabel(record.status)}</span></td></tr>)}</tbody></table></div>}</section>
      </main>
    </div>
  );
}
