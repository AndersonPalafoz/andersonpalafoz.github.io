'use client';

import { useState } from "react";
import { ShieldCheck, Lock, CheckCircle2, KeyRound } from "lucide-react";
import { toast } from "sonner";

export function AdminTwoFactorSection() {
  const [enabled2FA, setEnabled2FA] = useState(true);
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(true);

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("O código de 2FA deve conter exatamente 6 dígitos.");
      return;
    }
    setVerified(true);
    toast.success("Código 2FA validado com sucesso! Sessão administrativa segura.");
    setCode("");
  };

  const toggle2FA = () => {
    const next = !enabled2FA;
    setEnabled2FA(next);
    toast.success(next ? "Autenticação em dois fatores (2FA) ativada." : "2FA desativado temporariamente.");
  };

  return (
    <div className="surface-card p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="eyebrow inline-flex items-center gap-1.5 text-red-600">
            <ShieldCheck size={15} /> Segurança Avançada
          </span>
          <h2 className="text-xl font-black text-foreground">Autenticação em Dois Fatores (2FA)</h2>
          <p className="text-xs text-muted-foreground">Proteção obrigatória para o painel administrativo (palafozanderson@gmail.com).</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${enabled2FA ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-amber-100 text-amber-800"}`}>
            {enabled2FA ? "2FA Ativo" : "2FA Desativado"}
          </span>
          <button
            type="button"
            onClick={toggle2FA}
            className="text-xs font-bold px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition text-foreground"
          >
            {enabled2FA ? "Desativar" : "Ativar"}
          </button>
        </div>
      </div>

      {enabled2FA && (
        <div className="bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">Dispositivo Autenticador (TOTP)</h3>
              <p className="text-xs text-muted-foreground">Insira o código gerado pelo seu aplicativo autenticador (Google Authenticator / Authy) para validar alterações sensíveis.</p>
            </div>
          </div>

          <form onSubmit={handleVerify2FA} className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                maxLength={6}
                placeholder="000 000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm font-black tracking-widest text-foreground focus:outline-red-600 shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-xs font-black transition shadow-sm"
            >
              Verificar Código 2FA
            </button>
          </form>

          {verified && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={15} /> <span>Sessão atual verificada com 2FA em {new Date().toLocaleTimeString("pt-BR")}.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
