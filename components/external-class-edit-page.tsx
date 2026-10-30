"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ExternalClassCreateForm } from "./external-class-create-form";

type ClassRecord = Record<string, unknown> & { id: number };
export function ExternalClassEditPage() {
  const params = useParams<{ id: string }>(); const [item, setItem] = useState<ClassRecord | null>(null); const [error, setError] = useState("");
  useEffect(() => { fetch("/api/professor/external-classes", { cache: "no-store" }).then(async (response) => { const payload = await response.json(); if (!response.ok) throw new Error(payload.error || "Não foi possível carregar a turma."); const found = (payload.classes || []).find((entry: ClassRecord) => entry.id === Number(params.id)); if (!found) throw new Error("Turma não encontrada."); setItem(found); }).catch((cause) => setError(cause instanceof Error ? cause.message : "Não foi possível carregar a turma.")); }, [params.id]);
  if (error) return <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">{error}</p>;
  if (!item) return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Carregando dados da turma...</div>;
  const initialValues = Object.fromEntries(Object.entries(item).filter(([key]) => ["institution", "className", "courseName", "academicTerm", "description", "classDays", "classTime", "workloadHours", "startDate", "endDate", "passingAverage", "maxAbsencePercent", "durationType", "durationValue", "durationUnit", "modality", "level", "meetingLink", "classroomLocation", "instructorName", "monitors"].includes(key)).map(([key, value]) => [key, value == null ? "" : key.endsWith("Date") ? String(value).slice(0, 10) : String(value)]));
  return <ExternalClassCreateForm classId={item.id} initialValues={initialValues} />;
}
