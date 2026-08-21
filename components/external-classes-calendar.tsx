"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Video, Users, CheckCircle2 } from "lucide-react";

type ExternalClassItem = {
  id: number;
  title: string;
  organizationName: string;
  modality: "remota" | "presencial" | "hibrida";
  classDays: string; // ex: "Segunda, Quarta"
  classTime: string; // ex: "19:00 - 20:30"
  locationOrLink: string;
  startDate: string;
  endDate: string;
  maxAbsencesPercent: number;
  status: string;
};

interface ExternalClassesCalendarProps {
  classes: ExternalClassItem[];
}

export function ExternalClassesCalendar({ classes }: ExternalClassesCalendarProps) {
  const [selectedModality, setSelectedModality] = useState<string>("all");

  const filtered = classes.filter(c => selectedModality === "all" || c.modality === selectedModality);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between surface-card p-6 border border-border/70 rounded-3xl">
        <div>
          <h2 className="text-xl font-black text-foreground">Agenda e Calendário de Turmas</h2>
          <p className="text-sm text-muted-foreground">Visualize os dias, horários e modalidades das turmas externas cadastradas.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedModality}
            onChange={(e) => setSelectedModality(e.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">Todas as Modalidades</option>
            <option value="remota">Apenas Remotas</option>
            <option value="presencial">Apenas Presenciais</option>
            <option value="hibrida">Híbridas</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="surface-card p-12 text-center text-sm text-muted-foreground">
          Nenhuma turma encontrada para a modalidade selecionada.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((item) => (
            <div key={item.id} className="surface-card border border-border/70 p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-black uppercase text-red-700 dark:bg-red-950/50 dark:text-red-300">
                    {item.modality === "remota" ? <Video size={13} /> : <MapPin size={13} />}
                    {item.modality.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 size={13} /> {item.status || "Ativa"}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground">{item.title}</h3>
                  <p className="text-xs font-bold text-red-600 mt-0.5">{item.organizationName}</p>
                </div>
              </div>

              <div className="space-y-2.5 border-y border-border/60 py-4 text-xs">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <CalendarIcon size={15} className="text-muted-foreground shrink-0" />
                  <span>Dias: {item.classDays || "Não especificado"}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Clock size={15} className="text-muted-foreground shrink-0" />
                  <span>Horário: {item.classTime || "Não especificado"}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-semibold truncate">
                  {item.modality === "remota" ? <Video size={15} className="text-muted-foreground shrink-0" /> : <MapPin size={15} className="text-muted-foreground shrink-0" />}
                  <span className="truncate">Local/Link: {item.locationOrLink || "A definir"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users size={15} className="shrink-0" />
                  <span>Início: {item.startDate} • Término: {item.endDate} (Máx. faltas: {item.maxAbsencesPercent}%)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>ID da Turma: #{item.id}</span>
                <a href={`/professor/turmas-externas`} className="text-red-600 hover:underline">Gerenciar Turma</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
