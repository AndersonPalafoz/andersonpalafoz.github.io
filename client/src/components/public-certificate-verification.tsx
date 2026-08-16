import React, { useState } from "react";
import { Award, Search, CheckCircle2, ShieldCheck, QrCode, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface VerifiedCertificate {
  code: string;
  studentName: string;
  courseTitle: string;
  completionDate: string;
  level: string;
  issuer: string;
}

const mockDatabase: Record<string, VerifiedCertificate> = {
  "AP-2026-B2": {
    code: "AP-2026-B2",
    studentName: "Maria Clara Santos",
    courseTitle: "Curso Completo de Inglês — Nível B2 Upper-Intermediate",
    completionDate: "15 de Agosto de 2026",
    level: "B2 (CEFR)",
    issuer: "Anderson Palafoz Academic Platform",
  },
  "AP-2026-C1": {
    code: "AP-2026-C1",
    studentName: "João Pedro Alves",
    courseTitle: "English Proficiency Masterclass — Nível C1 Advanced",
    completionDate: "10 de Agosto de 2026",
    level: "C1 (CEFR)",
    issuer: "Anderson Palafoz Academic Platform",
  },
};

export function PublicCertificateVerification() {
  const [searchCode, setSearchCode] = useState("");
  const [result, setResult] = useState<VerifiedCertificate | null>(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    const found = mockDatabase[searchCode.trim().toUpperCase()];
    setSearched(true);
    setResult(found || null);

    if (found) {
      toast.success("Certificado verificado com autenticidade garantida!");
    } else {
      toast.error("Nenhum certificado encontrado com este código.");
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto my-12 px-4">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 px-4 py-2 rounded-full text-red-700 dark:text-red-300 text-xs font-black uppercase tracking-wider">
          <ShieldCheck size={16} /> Verificação Oficial de Autenticidade
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Validação de Certificados</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Digite o código de validação impresso no certificado ou escaneie o QR Code para confirmar a autenticidade acadêmica emitida pela plataforma.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Digite o código (ex: AP-2026-B2)..."
              className="pl-11 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-2xl text-sm font-bold h-12 uppercase"
              required
            />
          </div>
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-black text-xs h-12 px-8 rounded-2xl shadow-md gap-2 shrink-0"
          >
            <ShieldCheck size={16} /> Verificar Autenticidade
          </Button>
        </form>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0">
              <QrCode size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Dica para Demonstração</h4>
              <p className="text-[11px] text-slate-500">Teste com os códigos oficiais de exemplo: <code className="font-mono font-bold text-red-600">AP-2026-B2</code> ou <code className="font-mono font-bold text-red-600">AP-2026-C1</code></p>
            </div>
          </div>
        </div>

        {searched && (
          <div className="pt-4 animate-in fade-in duration-300">
            {result ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-900/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <CheckCircle2 size={26} />
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Certificado Válido & Autêntico</span>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white font-mono">{result.code}</h3>
                    </div>
                  </div>
                  <span className="text-xs font-black bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200 px-3 py-1 rounded-full">
                    {result.level}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-100 dark:border-slate-800 space-y-1">
                    <span className="text-slate-400 uppercase font-bold text-[10px] flex items-center gap-1">
                      <User size={13} /> Aluno(a) Titular
                    </span>
                    <p className="font-black text-slate-900 dark:text-white text-sm">{result.studentName}</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-100 dark:border-slate-800 space-y-1">
                    <span className="text-slate-400 uppercase font-bold text-[10px] flex items-center gap-1">
                      <Calendar size={13} /> Data de Emissão
                    </span>
                    <p className="font-black text-slate-900 dark:text-white text-sm">{result.completionDate}</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 uppercase font-bold text-[10px] flex items-center gap-1">
                    <Award size={13} /> Curso Concluído
                  </span>
                  <p className="font-black text-slate-900 dark:text-white text-sm">{result.courseTitle}</p>
                  <p className="text-[11px] text-slate-500 pt-1">Emitido por: {result.issuer}</p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-3xl p-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <ShieldCheck size={26} className="rotate-45" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Nenhum Certificado Localizado</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  O código inserido não corresponde a nenhum registro válido em nossa base de emissão acadêmica. Verifique se há erros de digitação.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
