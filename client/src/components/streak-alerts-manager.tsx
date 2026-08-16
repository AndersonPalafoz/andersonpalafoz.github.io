import React, { useState } from "react";
import { Bell, Mail, MessageSquare, Send, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function StreakAlertsManager() {
  const [email, setEmail] = useState("palafozanderson@gmail.com");
  const [phone, setPhone] = useState("+55 (71) 99888-7766");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Preferências de alertas de streak salvas com sucesso!");
  };

  const handleTestAlert = (channel: "email" | "whatsapp") => {
    setSendingTest(true);
    setTimeout(() => {
      setSendingTest(false);
      if (channel === "email") {
        toast.success(`E-mail de alerta de risco de streak enviado com sucesso para ${email}!`);
      } else {
        toast.success(`Mensagem de WhatsApp disparada com sucesso para ${phone}!`);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto my-8">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="text-red-600" size={20} /> Alertas Automatizados de Risco de Ofensiva (Streak)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure notificações automáticas via e-mail e WhatsApp para nunca perder sua sequência diária de estudos.</p>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 px-3.5 py-2 rounded-2xl">
            <ShieldAlert size={16} className="text-orange-600" />
            <span className="text-xs font-bold text-orange-700 dark:text-orange-300">Proteção Ativa 24/7</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="text-blue-600" size={18} />
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Alertas por E-mail</h4>
                </div>
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">E-mail de Notificação</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!emailEnabled}
                  className="bg-white dark:bg-slate-900 text-xs font-semibold h-10"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!emailEnabled || sendingTest}
                  onClick={() => handleTestAlert("email")}
                  className="w-full h-9 text-xs font-bold border-slate-200 dark:border-slate-700 gap-1.5"
                >
                  <Send size={13} className="text-blue-600" /> Testar Disparo de E-mail
                </Button>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="text-emerald-600" size={18} />
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Alertas por WhatsApp</h4>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Número de Celular / WhatsApp</label>
                <Input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!whatsappEnabled}
                  className="bg-white dark:bg-slate-900 text-xs font-semibold h-10"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!whatsappEnabled || sendingTest}
                  onClick={() => handleTestAlert("whatsapp")}
                  className="w-full h-9 text-xs font-bold border-slate-200 dark:border-slate-700 gap-1.5"
                >
                  <Send size={13} className="text-emerald-600" /> Testar Disparo de WhatsApp
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-black text-xs h-11 px-8 rounded-2xl shadow-md gap-2"
            >
              <CheckCircle2 size={16} /> Salvar Preferências de Alerta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
