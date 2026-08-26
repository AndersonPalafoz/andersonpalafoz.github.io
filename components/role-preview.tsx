"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Eye, RotateCcw } from "lucide-react";
import type { EffectiveRole } from "@/lib/role-capabilities";

type PreviewRole = "admin" | "professor";

type RolePreviewState = {
  actualRole: EffectiveRole;
  previewRole: PreviewRole | null;
  visibleRole: EffectiveRole;
  enabled: boolean;
  setPreviewRole: (role: PreviewRole | null) => void;
};

const RolePreviewContext = createContext<RolePreviewState | null>(null);
const STORAGE_KEY = "ap-role-preview";

export function RolePreviewProvider({ actualRole, enabled, children }: { actualRole: EffectiveRole; enabled: boolean; children: React.ReactNode }) {
  const [previewRole, setPreviewRoleState] = useState<PreviewRole | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "admin" || stored === "professor") setPreviewRoleState(stored);
  }, [enabled]);

  const setPreviewRole = (role: PreviewRole | null) => {
    setPreviewRoleState(role);
    if (!enabled) return;
    if (role) window.localStorage.setItem(STORAGE_KEY, role);
    else window.localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo<RolePreviewState>(() => ({
    actualRole,
    previewRole: enabled ? previewRole : null,
    visibleRole: enabled && previewRole ? previewRole : actualRole,
    enabled,
    setPreviewRole,
  }), [actualRole, enabled, previewRole]);

  return <RolePreviewContext.Provider value={value}>{children}</RolePreviewContext.Provider>;
}

export function useRolePreview() {
  const value = useContext(RolePreviewContext);
  if (!value) throw new Error("useRolePreview deve ser usado dentro de RolePreviewProvider.");
  return value;
}

export function RolePreviewToolbar() {
  const { actualRole, previewRole, enabled, setPreviewRole } = useRolePreview();
  if (!enabled || actualRole !== "superadmin") return null;

  return (
    <div className="shrink-0 rounded-xl border border-violet-200 bg-violet-50/90 px-2.5 py-1.5 text-violet-950 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-100">
      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.08em]">
        <Eye size={14} aria-hidden="true" />
        <span className="sr-only">Visualizar interface como</span>
        <select
          value={previewRole || "superadmin"}
          onChange={(event) => setPreviewRole(event.target.value === "superadmin" ? null : event.target.value as PreviewRole)}
          className="max-w-[138px] bg-transparent text-[10px] font-black outline-none"
          aria-label="Visualizar interface como outro papel"
        >
          <option value="superadmin">Visão superadmin</option>
          <option value="admin">Visualizar admin</option>
          <option value="professor">Visualizar professor</option>
        </select>
        {previewRole && <button type="button" onClick={() => setPreviewRole(null)} className="rounded-lg p-0.5 text-violet-700 hover:bg-violet-100 dark:text-violet-200 dark:hover:bg-violet-900/50" aria-label="Sair da visualização simulada"><RotateCcw size={13} /></button>}
      </label>
      {previewRole && <p className="mt-1 max-w-[260px] text-[9px] font-semibold normal-case leading-snug text-violet-800 dark:text-violet-200">Modo visual: sua sessão e as permissões reais permanecem inalteradas.</p>}
    </div>
  );
}
