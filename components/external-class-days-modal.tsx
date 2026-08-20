"use client";

import { useState } from "react";
import { Calendar, Check, X, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDays: string;
  currentModality: string;
  onSave: (days: string, modality: string) => void;
}

const WEEK_DAYS = [
  "Segundas-feiras",
  "Terças-feiras",
  "Quartas-feiras",
  "Quintas-feiras",
  "Sextas-feiras",
  "Sábados",
  "Domingos",
];

export function ExternalClassDaysModal({ isOpen, onClose, currentDays, currentModality, onSave }: DaysModalProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>(
    currentDays ? currentDays.split(", ").filter(Boolean) : []
  );
  const [modality, setModality] = useState(currentModality || "Remota");
  const [noDays, setNoDays] = useState(!currentDays || currentDays === "Não especificado");

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    setNoDays(false);
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleConfirm = () => {
    const finalDays = noDays || selectedDays.length === 0 ? "Não especificado" : selectedDays.join(", ");
    onSave(finalDays, modality);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-6 font-sans animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-red-100 dark:bg-red-950/60 p-2 text-red-600">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground">Configuração de Aulas</h3>
              <p className="text-xs text-muted-foreground">Modalidade e dias da semana</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Modalidade: Remota ou Presencial */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-foreground">Modalidade da Turma</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setModality("Remota")}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition ${
                modality === "Remota"
                  ? "border-red-600 bg-red-50 dark:bg-red-950/40 text-red-600 shadow-xs"
                  : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Globe size={16} /> Remota
            </button>
            <button
              type="button"
              onClick={() => setModality("Presencial")}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition ${
                modality === "Presencial"
                  ? "border-red-600 bg-red-50 dark:bg-red-950/40 text-red-600 shadow-xs"
                  : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              <MapPin size={16} /> Presencial
            </button>
          </div>
        </div>

        {/* Seleção de Dias da Semana */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-foreground">Dias da Semana de Aula</label>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={noDays}
                onChange={(e) => {
                  setNoDays(e.target.checked);
                  if (e.target.checked) setSelectedDays([]);
                }}
                className="rounded border-border text-red-600 focus:ring-red-600"
              />
              Não definir dias agora
            </label>
          </div>

          {!noDays && (
            <div className="grid grid-cols-2 gap-2">
              {WEEK_DAYS.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-bold transition ${
                      isSelected
                        ? "border-red-600 bg-red-600 text-white shadow-xs"
                        : "border-border bg-muted/40 text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{day}</span>
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-bold">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white">
            Confirmar Configuração
          </Button>
        </div>
      </div>
    </div>
  );
}
