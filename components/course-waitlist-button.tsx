"use client";

import React, { useState } from "react";
import { Bell, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export function CourseWaitlistButton({ courseId }: { courseId: number }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleWaitlist = async (targetEmail?: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/courses/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, email: targetEmail || session?.user?.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao registrar aviso.");
      setSubscribed(true);
      toast.success("Sucesso! Você será avisado quando o curso for publicado.");
    } catch (err: any) {
      toast.error(err.message || "Não foi possível registrar o aviso.");
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-6 py-3 rounded-xl font-bold text-sm">
        <CheckCircle2 size={18} />
        <span>Aviso Ativado com Sucesso</span>
      </div>
    );
  }

  if (!session?.user?.email && showInput) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <input
          type="email"
          placeholder="Seu melhor e-mail"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-border bg-white dark:bg-card text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 w-full sm:w-auto"
        />
        <button
          onClick={() => {
            if (!emailInput || !emailInput.includes("@")) {
              toast.error("Informe um e-mail válido.");
              return;
            }
            void handleWaitlist(emailInput);
          }}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 shadow-md shadow-red-600/20 disabled:opacity-50 whitespace-nowrap"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          <span>Confirmar Aviso</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        if (!session?.user?.email) {
          setShowInput(true);
          return;
        }
        void handleWaitlist();
      }}
      disabled={loading}
      className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3.5 rounded-xl font-bold transition flex items-center gap-2 shadow-md shadow-amber-600/20 disabled:opacity-50"
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      <Bell size={18} />
      <span>Avise-me quando disponível</span>
    </button>
  );
}
