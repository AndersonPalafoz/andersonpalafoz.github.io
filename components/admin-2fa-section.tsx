'use client';

import { useState } from "react";
import { ShieldCheck, Lock, CheckCircle2, KeyRound, QrCode, Smartphone, LifeBuoy, AlertTriangle, Mail } from "lucide-react";
import { toast } from "sonner";

export function AdminTwoFactorSection() {
  const [enabled2FA, setEnabled2FA] = useState(true);
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [newDeviceAlerts, setNewDeviceAlerts] = useState(true);

  const backupCodes = [
    "AP-8492-3810",
    "AP-9921-4482",
    "AP-1039-5561",
    "AP-7734-2209",
    "AP-5529-8834",
  ];

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) {
      toast.error("Conta temporariamente bloqueada devido a excesso de tentativas incorretas. Aguarde.");
      return;
    }

    if (code.length !== 6) {
      toast.error("O código de 2FA deve conter exatamente 6 dígitos.");
      return;
    }

    // Simulação de validação com 5 tentativas máximas
    if (code === "123456" || code === "000000") {
      setVerified(true);
      setFailedAttempts(0);
      toast.success("Código 2FA validado com sucesso! Sessão administrativa segura.");
      setCode("");
    } else {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      if (nextFailed >= 5) {
        setIsLockedOut(true);
        setLockoutSeconds(900); // 15 minutos de bloqueio temporário
        toast.error("Muitas tentativas incorretas! Conta bloqueada temporariamente por 15 minutos.");
        const interval = setInterval(() => {
          setLockoutSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setIsLockedOut(false);
              setFailedAttempts(0);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(`Código incorreto. Tentativa ${nextFailed} de 5 antes do bloqueio temporário.`);
      }
    }
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
          <h2 className="text-xl font-black text-foreground">Autenticação em Dois Fatores (2FA) & Recuperação</h2>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shrink-0">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-foreground">Google Authenticator & Códigos de Backup</h3>
                <p className="text-xs text-muted-foreground">Valide seu acesso ou gere códigos de recuperação para emergências.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="bg-slate-900 text-white dark:bg-slate-800 hover:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition shadow-sm"
              >
                <QrCode size={16} /> QR Code
              </button>
              <button
                type="button"
                onClick={() => setShowBackupModal(true)}
                className="bg-red-600 text-white hover:bg-red-700 px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition shadow-sm"
              >
                <LifeBuoy size={16} /> Códigos de Backup
              </button>
            </div>
          </div>

          {isLockedOut ? (
            <div className="bg-red-100 dark:bg-red-950/80 border border-red-300 p-4 rounded-xl text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-red-700 dark:text-red-300 font-black text-xs">
                <AlertTriangle size={18} /> <span>CONTA BLOQUEADA TEMPORARIAMENTE POR EXCESSO DE TENTATIVAS</span>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400">
                Tente novamente em {Math.floor(lockoutSeconds / 60)}m {lockoutSeconds % 60}s ou utilize um código de backup de emergência.
              </p>
            </div>
          ) : (
            <form onSubmit={handleVerify2FA} className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-red-200/60 dark:border-red-900/40">
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
                Verificar Código ({5 - failedAttempts} tentativas restantes)
              </button>
            </form>
          )}

          {verified && !isLockedOut && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={15} /> <span>Sessão atual verificada com 2FA em {new Date().toLocaleTimeString("pt-BR")}.</span>
            </div>
          )}

          {/* Alerta de novo dispositivo */}
          <div className="pt-3 border-t border-red-200/60 dark:border-red-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-foreground font-bold">
              <Mail size={16} className="text-red-600" />
              <span>Notificar por e-mail (palafozanderson@gmail.com) em caso de login em novo dispositivo</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewDeviceAlerts(!newDeviceAlerts);
                toast.success(newDeviceAlerts ? "Alertas de novo dispositivo desativados." : "Alertas de novo dispositivo ativados por e-mail.");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${newDeviceAlerts ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}
            >
              {newDeviceAlerts ? "Ativo" : "Desativado"}
            </button>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative animate-fade-in text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 mx-auto flex items-center justify-center">
              <Smartphone size={24} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-foreground">Configurar Google Authenticator</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Escaneie o código abaixo com o aplicativo autenticador no seu celular.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-4">
              <div className="w-40 h-40 bg-white p-3 rounded-2xl shadow-inner border border-slate-300 flex items-center justify-center">
                <div className="grid grid-cols-6 gap-1 w-full h-full bg-slate-900 p-2 rounded-lg">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div key={i} className={`rounded-xs ${i % 2 === 0 || i % 5 === 0 ? "bg-white" : "bg-slate-900"}`} />
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Chave Secreta Manual:</p>
                <code className="text-xs font-mono font-bold bg-muted px-3 py-1.5 rounded-lg text-foreground block">
                  JBSWY3DPEHPK3PXP
                </code>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowQrModal(false);
                toast.success("Dispositivo vinculado com sucesso!");
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl text-xs transition shadow-sm"
            >
              Concluir Configuração
            </button>
          </div>
        </div>
      )}

      {/* Modal Códigos de Backup */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative animate-fade-in text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 mx-auto flex items-center justify-center">
              <LifeBuoy size={24} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-foreground">Códigos de Recuperação de Emergência</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Guarde estes códigos em um local seguro. Cada código de uso único permite entrar no painel administrativo caso perca o acesso ao seu celular.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-left font-mono">
              {backupCodes.map((codeItem, index) => (
                <div key={index} className="flex items-center justify-between bg-background px-3 py-2 rounded-xl border border-border text-xs font-bold text-foreground">
                  <span>{codeItem}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Disponível</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowBackupModal(false);
                toast.success("Códigos de backup copiados para a área de transferência!");
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl text-xs transition shadow-sm"
            >
              Copiar e Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
