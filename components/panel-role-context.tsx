import { getEffectiveRole, roleLabel, type StoredRole } from "@/lib/role-capabilities";

type PanelRoleContextProps = {
  panel: "admin" | "professor";
  email?: string | null;
  role?: StoredRole;
};

const styles = {
  superadmin: "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-100",
  admin: "border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-100",
  professor: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-100",
  student: "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
} as const;

export function PanelRoleContext({ panel, email, role }: PanelRoleContextProps) {
  const effectiveRole = getEffectiveRole({ email, role });
  const panelLabel = panel === "admin" ? "Centro de governança" : "Espaço de trabalho docente";
  const description = effectiveRole === "superadmin"
    ? "Acesso global, incluindo CMS, operações financeiras e auditoria." 
    : effectiveRole === "admin"
      ? "Gestão completa de pessoas, conteúdo, certificados e moderação."
      : "Você visualiza e gerencia somente cursos, alunos e turmas vinculados ao seu escopo.";

  return (
    <div className="site-shell border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="page-container flex min-h-11 flex-wrap items-center justify-between gap-2 py-2">
        <div className="flex min-w-0 items-center gap-2 text-xs">
          <span className="font-black uppercase tracking-[0.14em] text-muted-foreground">{panelLabel}</span>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <span className="hidden truncate text-muted-foreground sm:block">{description}</span>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${styles[effectiveRole]}`}>
          {roleLabel(effectiveRole)}
        </span>
      </div>
    </div>
  );
}
