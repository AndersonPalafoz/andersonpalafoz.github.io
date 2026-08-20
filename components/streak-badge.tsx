"use client";

import { useEffect, useState, useRef } from "react";
import { Flame, Calendar, CheckCircle2, XCircle } from "lucide-react";

interface RecentDay {
  dateKey: string;
  dayLabel: string;
  active: boolean;
}

export function StreakBadge() {
  const [streakDays, setStreakDays] = useState<number | null>(null);
  const [recentDays, setRecentDays] = useState<RecentDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/user/streak", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setStreakDays(typeof data.streakDays === "number" ? data.streakDays : 0);
          setRecentDays(Array.isArray(data.recentDays) ? data.recentDays : []);
        } else {
          setStreakDays(0);
        }
      } catch {
        setStreakDays(0);
      } finally {
        setLoading(false);
      }
    };
    void fetchStreak();

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="hidden sm:flex items-center gap-2 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 px-3 py-1.5 rounded-full animate-pulse">
        <div className="h-4 w-4 bg-amber-300 dark:bg-amber-800 rounded-full" />
        <div className="h-3 w-6 bg-amber-300 dark:bg-amber-800 rounded" />
      </div>
    );
  }

  if (streakDays === null || streakDays <= 0) {
    return null;
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setPopoverOpen(!popoverOpen)}
        className="hidden sm:flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-3.5 py-1.5 rounded-full text-xs font-black text-amber-700 dark:text-amber-400 shadow-xs transition hover:scale-105 hover:bg-amber-100 dark:hover:bg-amber-900/40"
        title={`🔥 ${streakDays} dias de ofensiva contínua! Clique para ver o calendário recente.`}
        aria-expanded={popoverOpen}
      >
        <Flame size={15} className="text-amber-600 animate-pulse fill-amber-500" />
        <span>{streakDays}d</span>
      </button>

      {popoverOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-3xl border border-border/80 bg-card p-5 text-card-foreground shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                <Flame size={18} className="fill-amber-500" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground">{streakDays} dias de ofensiva</p>
                <p className="text-[10px] font-semibold text-muted-foreground">Estudo diário consistente</p>
              </div>
            </div>
            <Calendar size={16} className="text-muted-foreground" />
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">
              Sua ofensiva é calculada automaticamente a partir da conclusão diária de aulas ou atividades na plataforma.
            </p>

            <div className="space-y-1.5">
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Atividade recente (Últimos 7 dias):</p>
              <div className="grid grid-cols-7 gap-1 pt-1">
                {recentDays.map((d) => (
                  <div key={d.dateKey} className="flex flex-col items-center gap-1 text-center">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-xl text-[11px] font-bold transition ${d.active ? "bg-amber-500 text-white shadow-xs" : "bg-muted text-muted-foreground"}`}>
                      {d.active ? <CheckCircle2 size={13} /> : <span className="text-[10px]">{d.dayLabel[0]}</span>}
                    </span>
                    <span className="text-[9px] font-semibold text-muted-foreground">{d.dayLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
