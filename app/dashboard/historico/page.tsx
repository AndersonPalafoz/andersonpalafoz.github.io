"use client";

import { useEffect, useState } from "react";
import { Award, Calendar, FileText, Loader2, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface ActivityRecord {
  id: number;
  score: number | null;
  status: string;
  teacherFeedback: string | null;
  submittedAt: string | null;
}

interface AttendanceRecord {
  id: number;
  present: boolean;
  status: "present" | "absent" | "justified";
  notes: string | null;
  recordedAt: string;
  sessionTitle: string;
  scheduledAt: string;
  modality: string;
}

export default function StudentHistoricoPage() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const loadHistorico = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/user/historico", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao carregar histórico.");
        setActivities(data.activities);
        setAttendances(data.attendances);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao carregar histórico.");
      } finally {
        setLoading(false);
      }
    };
    void loadHistorico();
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-red-600" size={32} /></div>;
  }

  const totalAttendances = attendances.length;
  const presentCount = attendances.filter((a) => a.status === "present").length;
  const attendanceRate = totalAttendances > 0 ? Math.round((presentCount / totalAttendances) * 100) : 100;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Histórico Acadêmico</h1>
        <p className="text-gray-600">Acompanhe suas notas em avaliações e seu registro de frequência nas aulas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><UserCheck size={24} /></div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Taxa de Presença</p>
              <h2 className="text-2xl font-black text-gray-900">{attendanceRate}%</h2>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Calendar size={24} /></div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Aulas Registradas</p>
              <h2 className="text-2xl font-black text-gray-900">{totalAttendances}</h2>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600"><Award size={24} /></div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Atividades Avaliadas</p>
              <h2 className="text-2xl font-black text-gray-900">{activities.length}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Calendar size={20} className="text-red-600" /> Registro de Frequência nas Aulas</h2>
          {attendances.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">Nenhum registro de chamada encontrado para sua conta.</p>
          ) : (
            <div className="space-y-3">
              {attendances.map((att) => {
                const badgeColor = att.status === "present" ? "bg-green-100 text-green-700" : att.status === "absent" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";
                const badgeText = att.status === "present" ? "Presente" : att.status === "absent" ? "Ausente" : "Justificado";
                return (
                  <div key={att.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{att.sessionTitle}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${badgeColor}`}>{badgeText}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Modalidade: <span className="uppercase font-semibold">{att.modality}</span> · Data: {new Date(att.scheduledAt).toLocaleString("pt-BR")}</p>
                      {att.notes && <p className="text-xs text-gray-600 mt-2 bg-white p-2 rounded border">Obs: {att.notes}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText size={20} className="text-red-600" /> Notas e Avaliações de Atividades</h2>
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">Nenhuma atividade avaliada ou com nota registrada ainda.</p>
          ) : (
            <div className="space-y-3">
              {activities.map((act) => (
                <div key={act.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-sm">Atividade #{act.id}</span>
                    <span className="font-black text-red-600 bg-red-50 px-3 py-1 rounded-lg text-sm">{act.score !== null ? `${act.score} pts` : "Pendente de nota"}</span>
                  </div>
                  {act.teacherFeedback && (
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs text-gray-700">
                      <p className="font-bold text-gray-900 mb-1">Feedback do Professor:</p>
                      <p>{act.teacherFeedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
