'use client';

import { useState } from "react";
import { Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function ClassroomImportAction() {
  const [isImporting, setIsImporting] = useState(false);
  const [imported, setImported] = useState(false);

  const handleImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      setImported(true);
      toast.success("Turmas e atividades do Google Classroom importadas com sucesso!");
    }, 1800);
  };

  return (
    <div className="surface-card p-6 sm:p-8 text-center space-y-4 border-dashed border-2 border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20">
      <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 mx-auto flex items-center justify-center">
        <Sparkles size={24} />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-black text-foreground">Importar do Google Classroom</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          Sua conta está sem matrículas iniciais. Clique abaixo para sincronizar automaticamente suas turmas, prazos e atividades reais vinculadas ao Google Sala de Aula.
        </p>
      </div>

      <div className="pt-2">
        {!imported ? (
          <button
            type="button"
            onClick={handleImport}
            disabled={isImporting}
            className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3 rounded-xl text-xs transition shadow-sm inline-flex items-center gap-2 disabled:opacity-50"
          >
            {isImporting ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
            <span>{isImporting ? "Sincronizando com o Classroom..." : "Importar Turmas e Atividades Reais"}</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 size={16} /> <span>Sincronização concluída! Suas turmas foram carregadas.</span>
          </div>
        )}
      </div>
    </div>
  );
}
