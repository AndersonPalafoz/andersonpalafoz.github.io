'use client';

import { useEffect, useState, useCallback, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { Clock, ShieldAlert } from "lucide-react";

const DEFAULT_INACTIVITY_MINUTES = 20;
const WARNING_BEFORE_MS = 60 * 1000; // Aviso 1 minuto antes

export function InactivityMonitor() {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const { status } = useSession();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getLimitMinutes = () => {
    if (typeof window === "undefined") return DEFAULT_INACTIVITY_MINUTES;
    const stored = localStorage.getItem("ap_inactivity_minutes");
    const parsed = stored ? Number.parseInt(stored, 10) : DEFAULT_INACTIVITY_MINUTES;
    return [10, 20, 30, 45, 60].includes(parsed) ? parsed : DEFAULT_INACTIVITY_MINUTES;
  };

  const triggerLogout = useCallback(() => {
    signOut({ callbackUrl: "/login?reason=inactivity" });
  }, []);

  const resetTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setShowWarning(false);
    setSecondsRemaining(60);

    if (status !== "authenticated") return;
    const limitMs = getLimitMinutes() * 60 * 1000;
    const warningDelay = Math.max(1000, limitMs - WARNING_BEFORE_MS);

    // Configurar temporizador de aviso
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      let remaining = 60;
      setSecondsRemaining(remaining);
      
      countdownIntervalRef.current = setInterval(() => {
        remaining -= 1;
        setSecondsRemaining(remaining);
        if (remaining <= 0) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          triggerLogout();
        }
      }, 1000);
    }, warningDelay);

    // Configurar temporizador final de logout
    timerRef.current = setTimeout(() => {
      triggerLogout();
    }, limitMs);
    }, [status, triggerLogout]);

  useEffect(() => {
    if (status !== "authenticated") {
      setShowWarning(false);
      return;
    }

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];

    const handleUserActivity = () => {
      if (!showWarning) {
        resetTimers();
      }
    };

    const handlePreferenceChange = () => resetTimers();
    events.forEach(eventName => {
      window.addEventListener(eventName, handleUserActivity);
    });
    window.addEventListener("storage", handlePreferenceChange);
    window.addEventListener("ap:inactivity-changed", handlePreferenceChange);

    resetTimers();

    return () => {
      events.forEach(eventName => {
        window.removeEventListener(eventName, handleUserActivity);
      });
      window.removeEventListener("storage", handlePreferenceChange);
      window.removeEventListener("ap:inactivity-changed", handlePreferenceChange);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [resetTimers, showWarning, status]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 mx-auto flex items-center justify-center animate-pulse">
          <ShieldAlert size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Inatividade Detectada</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Para proteger sua conta, você será desconectado automaticamente por inatividade em:
          </p>
        </div>

        <div className="text-4xl font-black text-red-600 flex items-center justify-center gap-2">
          <Clock size={32} />
          <span>{secondsRemaining}s</span>
        </div>

        <button
          type="button"
          onClick={resetTimers}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl text-xs transition shadow-md"
        >
          Continuar Conectado
        </button>
      </div>
    </div>
  );
}
