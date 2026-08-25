'use client';

import { useState, useEffect } from "react";
import { Clock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function ProfileInactivitySettings() {
  const [minutes, setMinutes] = useState(20);

  useEffect(() => {
    const saved = localStorage.getItem("ap_inactivity_minutes");
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) setMinutes(parsed);
    }
  }, []);

  const handleChangeMinutes = (val: number) => {
    setMinutes(val);
    localStorage.setItem("ap_inactivity_minutes", String(val));
    window.dispatchEvent(new CustomEvent("ap:inactivity-changed"));
    toast.success(`Tempo limite de inatividade alterado para ${val} minutos.`);
  };

  return (
    <div className="p-6 rounded-xl border border-gray-200 bg-white space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="text-red-600" size={20} />
        <h3 className="font-bold text-gray-900 text-sm">Segurança & Inatividade</h3>
      </div>
      <p className="text-xs text-gray-500">
        Defina o tempo limite de ociosidade necessário para que sua sessão seja encerrada automaticamente.
      </p>

      <div className="flex items-center gap-3 pt-2">
        {[10, 20, 30, 45, 60].map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleChangeMinutes(opt)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${minutes === opt ? "bg-red-600 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {opt} min
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2 text-[11px] text-emerald-600 font-bold">
        <ShieldCheck size={14} /> <span>Sua preferência foi salva com segurança neste navegador.</span>
      </div>
    </div>
  );
}
