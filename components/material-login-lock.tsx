"use client";

import Link from "next/link";
import { Lock, LogIn } from "lucide-react";

export function MaterialLoginLock({ materialId }: { materialId?: number }) {
  const callbackUrl = materialId ? `/materiais/${materialId}` : "/materiais";
  const loginHref = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <Link
      href={loginHref}
      className="group relative inline-flex min-h-10 items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-950 transition hover:border-amber-400 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100 dark:hover:bg-amber-950/80"
      aria-label="Material protegido. Faça login para baixar"
      title="Faça login para baixar este material"
    >
      <Lock size={15} aria-hidden="true" />
      <span>Login para baixar</span>
      <LogIn size={14} aria-hidden="true" />
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg bg-slate-950 px-3 py-2 text-center text-[11px] font-semibold leading-4 text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        Este material é protegido. Entre na sua conta para liberar o download.
      </span>
    </Link>
  );
}
