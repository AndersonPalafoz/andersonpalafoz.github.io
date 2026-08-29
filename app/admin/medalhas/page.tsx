"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Award, ArrowLeft, PlusCircle, ShieldCheck, Sparkles, Loader, Search, X, CheckCircle2, CircleAlert, Copy, Eye, FileText, ListChecks, Trash2, UsersRound, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/useAuth";
import { canAccessAdminPortal } from "@/lib/role-capabilities";

interface MedalCatalogItem {
  id: number;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  requirement: string;
}

interface UserRecord {
  id: number;
  name: string | null;
  email: string | null;
}

interface GrantedMedalRecord {
  id: number;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  medalCode: string;
  grantType: string;
  notes: string | null;
  createdAt: string;
}

const CATEGORY_META: Record<string, { label: string; description: string; tone: string }> = {
  manual: { label: "Manual", description: "Reconhecimento concedido por observação pedagógica.", tone: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200" },
  academic: { label: "Acadêmica", description: "Evidência ligada ao desenvolvimento de uma competência.", tone: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200" },
  achievement: { label: "Conquista", description: "Marco relevante alcançado na jornada do aluno.", tone: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200" },
  streak: { label: "Constância", description: "Regularidade e compromisso contínuo com os estudos.", tone: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-200" },
};

const ICON_OPTIONS = ["🏅", "🌟", "🚀", "🧠", "✍️", "🎧", "🗣️", "🤝"];

const MEDAL_TEMPLATES: Record<string, { code: string; title: string; icon: string; description: string; requirement: string }> = {
  manual: {
    code: "participacao-destacada-custom",
    title: "Participação Destacada",
    icon: "🌟",
    description: "Reconhece uma contribuição relevante observada pelo professor.",
    requirement: "Concessão manual com justificativa pedagógica registrada.",
  },
  academic: {
    code: "escrita-em-destaque-custom",
    title: "Escrita em Destaque",
    icon: "✍️",
    description: "Reconhece uma produção escrita cuidadosa e orientada por feedback.",
    requirement: "Concluir uma produção escrita avaliada pelo professor com feedback registrado.",
  },
  achievement: {
    code: "primeiro-passo-custom",
    title: "Primeiro Passo",
    icon: "🚀",
    description: "Celebra o primeiro marco concluído na jornada de aprendizagem.",
    requirement: "Concluir a primeira atividade ou aula com progresso persistido.",
  },
  streak: {
    code: "constancia-na-trilha-custom",
    title: "Constância na Trilha",
    icon: "🔥",
    description: "Reconhece o compromisso contínuo com a aprendizagem.",
    requirement: "Manter uma sequência de estudos registrada por pelo menos sete dias.",
  },
};

const normalizeMedalCode = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 64);

export default function AdminMedalsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [catalog, setCatalog] = useState<MedalCatalogItem[]>([]);
  const [grantedList, setGrantedList] = useState<GrantedMedalRecord[]>([]);
  const [allUsers, setAllUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedMedalCode, setSelectedMedalCode] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createTouched, setCreateTouched] = useState(false);
  const [newMedal, setNewMedal] = useState({ code: "", title: "", icon: "🏅", category: "manual", description: "", requirement: "" });
  const [selectedBatchUserIds, setSelectedBatchUserIds] = useState<string[]>([]);
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [batchMedalCode, setBatchMedalCode] = useState("");
  const [batchNotes, setBatchNotes] = useState("");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("all");

  const catalogCategories = useMemo(() => Array.from(new Set(catalog.map((medal) => medal.category))).sort(), [catalog]);
  const filteredCatalog = useMemo(() => {
    const query = catalogQuery.trim().toLocaleLowerCase("pt-BR");
    return catalog.filter((medal) => {
      const inCategory = catalogCategory === "all" || medal.category === catalogCategory;
      const searchable = `${medal.title} ${medal.description} ${medal.requirement} ${medal.code}`.toLocaleLowerCase("pt-BR");
      return inCategory && (!query || searchable.includes(query));
    });
  }, [catalog, catalogCategory, catalogQuery]);

  const selectedMedal = catalog.find((medal) => medal.code === selectedMedalCode);
  const selectedUser = allUsers.find((item) => String(item.id) === selectedUserId);
  const selectedBatchMedal = catalog.find((medal) => medal.code === batchMedalCode);
  const categoryMeta = CATEGORY_META[newMedal.category] || CATEGORY_META.manual;
  const codeIsValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newMedal.code) && newMedal.code.length <= 64;
  const createFormReady = codeIsValid && newMedal.title.trim().length >= 3 && newMedal.description.trim().length >= 12 && newMedal.requirement.trim().length >= 12;
  const createFieldError = (condition: boolean) => createTouched && condition;
  const fillTemplate = () => {
    const template = MEDAL_TEMPLATES[newMedal.category] || MEDAL_TEMPLATES.manual;
    setNewMedal((current) => ({ ...current, ...template }));
    setCreateTouched(false);
    toast.success("Modelo aplicado. Revise os textos antes de criar a medalha.");
  };

  const copyMedalCode = async () => {
    if (!newMedal.code) return;
    try {
      await navigator.clipboard.writeText(newMedal.code);
      toast.success("Código copiado.");
    } catch {
      toast.error("Não foi possível copiar o código.");
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/medals");
      if (!res.ok) throw new Error("Falha ao carregar dados de medalhas");
      const data = await res.json();
      setCatalog(data.catalog || []);
      setGrantedList(data.grantedList || []);
      setAllUsers(data.allUsers || []);
    } catch (err) {
      toast.error("Erro ao carregar o gerenciador de medalhas.");
    } finally {
      setLoading(false);
    }
  };

  const [revokingId, setRevokingId] = useState<number | null>(null);
  const handleRevoke = async (grant: GrantedMedalRecord) => {
    if (!window.confirm(`Revogar esta medalha de ${grant.userName || grant.userEmail}? Ela poderá ser concedida novamente no futuro.`)) return;
    setRevokingId(grant.id);
    try {
      const res = await fetch(`/api/admin/medals?grantId=${grant.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível revogar a medalha.");
      setGrantedList((current) => current.filter((item) => item.id !== grant.id));
      toast.success("Medalha revogada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível revogar a medalha.");
    } finally {
      setRevokingId(null);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || !canAccessAdminPortal({ email: user.email, role: user.role })) {
      window.location.href = "/";
      return;
    }
    fetchData();
  }, [user, authLoading]);

  const handleGrantMedal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedMedalCode || notes.trim().length < 8) {
      toast.error("Selecione um aluno e uma medalha e informe uma justificativa com pelo menos 8 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/medals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(selectedUserId),
          medalCode: selectedMedalCode,
          notes: notes.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error || "Erro ao conceder medalha");

      toast.success(data.message || "Medalha concedida com sucesso ao aluno!");
      setSelectedUserId("");
      setSelectedMedalCode("");
      setNotes("");
      fetchData();
    } catch (err) {
      toast.error("Erro ao registrar a concessão da medalha.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGrantBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchUserIds.length || !batchMedalCode || batchNotes.trim().length < 8) {
      toast.error("Selecione alunos, uma medalha e informe uma justificativa.");
      return;
    }
    setBatchSubmitting(true);
    try {
      const res = await fetch("/api/admin/medals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "grant-batch", userIds: selectedBatchUserIds.map(Number), medalCode: batchMedalCode, notes: batchNotes.trim() }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível conceder as medalhas.");
      toast.success(data.message || "Medalhas concedidas com sucesso.");
      setSelectedBatchUserIds([]);
      setBatchMedalCode("");
      setBatchNotes("");
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao conceder medalhas.");
    } finally {
      setBatchSubmitting(false);
    }
  };

  const handleCreateMedal = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateTouched(true);
    if (!createFormReady) {
      toast.error("Revise o código, título, descrição e requisito antes de criar a medalha.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/medals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...newMedal }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível criar a medalha.");
      toast.success("Medalha criada e adicionada ao catálogo.");
      setNewMedal({ code: "", title: "", icon: "🏅", category: "manual", description: "", requirement: "" });
      setCreateTouched(false);
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar a medalha.");
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="site-shell flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-red-600" size={36} />
      </div>
    );
  }

  return (
    <div className="site-shell min-h-screen pb-16 text-foreground">
      <div className="page-container space-y-6 py-4 sm:space-y-8 sm:py-8">
        <section className="dashboard-hero grid min-w-0 gap-5 rounded-2xl p-4 sm:gap-6 sm:rounded-3xl sm:p-8 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.7fr)] xl:items-center">
          <div className="relative z-[1] min-w-0 space-y-3">
            <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-black text-red-700 transition hover:text-red-800 dark:text-red-300 dark:hover:text-red-200">
              <ArrowLeft size={14} /> Voltar ao Painel Admin
            </Link>
            <div className="section-kicker w-fit"><Award size={15} /> Governança de conquistas</div>
            <h1 className="max-w-3xl break-words text-[clamp(1.85rem,7vw,2.7rem)] font-black leading-[1.05] tracking-tight text-foreground [overflow-wrap:anywhere]">Gestão de Medalhas &amp; Conquistas</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">Organize reconhecimentos acadêmicos, acompanhe concessões e premie evidências de aprendizagem com clareza.</p>
          </div>
          <div className="relative z-[1] rounded-2xl border border-red-100 bg-white/75 p-4 shadow-sm backdrop-blur dark:border-red-900/40 dark:bg-slate-950/25">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300"><ShieldCheck size={20} /></div>
              <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-700 dark:text-red-300">Acesso administrativo</p><p className="mt-1 text-sm font-bold text-foreground">Concessões registradas com justificativa</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Cada ação gera histórico e notificação para o aluno.</p></div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Medalhas no catálogo", value: catalog.length, icon: Award, tone: "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-300" },
            { label: "Concessões recentes", value: grantedList.length, icon: CheckCircle2, tone: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300" },
            { label: "Alunos elegíveis", value: allUsers.length, icon: UsersRound, tone: "text-blue-700 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-300" },
            { label: "Categorias ativas", value: catalogCategories.length, icon: ListChecks, tone: "text-violet-700 bg-violet-50 dark:bg-violet-950/30 dark:text-violet-300" },
          ].map((metric) => (
            <div key={metric.label} className="surface-card min-w-0 rounded-2xl p-4 sm:p-5">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${metric.tone}`}><metric.icon size={18} /></div>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">{metric.label}</p>
              <p className="mt-1 text-2xl font-black tracking-tight text-foreground">{metric.value}</p>
            </div>
          ))}
        </section>

        {/* Formulário de Concessão Manual */}
        <section className="surface-card rounded-3xl p-5 sm:p-7">
          <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300"><PlusCircle size={21} /></div>
              <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-black">Conceder medalha</h2><span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">Ação manual</span></div><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Escolha um aluno, selecione uma conquista e registre a evidência pedagógica que justifica o reconhecimento.</p></div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground"><FileText size={15} className="text-red-600" /> O histórico e a notificação são gerados automaticamente.</div>
          </div>

          <form onSubmit={handleGrantMedal} className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)]">
            <label htmlFor="manual-medal-student" className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Aluno destinatário
              <select id="manual-medal-student" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} required className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-600/20">
                <option value="">Selecione um aluno...</option>
                {allUsers.map((item) => <option key={item.id} value={item.id}>{item.name || "Sem Nome"} · {item.email || `Aluno #${item.id}`}</option>)}
              </select>
            </label>

            <label htmlFor="manual-medal-catalog" className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Medalha do catálogo
              <select id="manual-medal-catalog" value={selectedMedalCode} onChange={(e) => setSelectedMedalCode(e.target.value)} required className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-600/20">
                <option value="">Selecione uma medalha...</option>
                {catalog.map((item) => <option key={item.code} value={item.code}>{item.icon} {item.title} · {CATEGORY_META[item.category]?.label || item.category}</option>)}
              </select>
            </label>

            <label htmlFor="manual-medal-notes" className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Justificativa pedagógica
              <textarea id="manual-medal-notes" value={notes} onChange={(e) => setNotes(e.target.value)} required minLength={8} maxLength={500} rows={3} placeholder="Ex.: participação qualificada na aula de conversação B1." className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-3.5 py-3 text-sm font-medium leading-6 text-foreground shadow-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-600/20" />
              <span className="mt-1 block text-right text-[11px] font-semibold text-muted-foreground">{notes.length}/500 caracteres · mínimo 8</span>
            </label>

            {(selectedUser || selectedMedal) && <div className="lg:col-span-2 flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-muted/25 p-3 text-sm">
              <div className="flex min-w-0 items-center gap-2"><UsersRound size={16} className="shrink-0 text-blue-600" /><span className="truncate font-bold text-foreground">{selectedUser?.name || "Aluno não selecionado"}</span></div>
              <span className="hidden text-muted-foreground sm:inline">×</span>
              <div className="flex min-w-0 items-center gap-2"><span className="text-xl">{selectedMedal?.icon || "🏅"}</span><span className="truncate font-bold text-foreground">{selectedMedal?.title || "Medalha não selecionada"}</span></div>
            </div>}

            <div className="flex flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center lg:col-span-3">
              {selectedMedal && <span className="text-xs leading-5 text-muted-foreground sm:mr-auto">{CATEGORY_META[selectedMedal.category]?.description || "Reconhecimento registrado no catálogo."}</span>}
              <Button type="submit" disabled={submitting || !selectedUserId || !selectedMedalCode || notes.trim().length < 8} className="min-h-11 rounded-xl bg-red-600 px-6 font-black text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
                {submitting ? <Loader className="animate-spin" size={17} /> : <Sparkles size={17} />} Conceder medalha
              </Button>
            </div>
          </form>
        </section>

        <section className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.58fr)]">
          <form onSubmit={handleCreateMedal} className="surface-card min-w-0 rounded-3xl p-5 sm:p-7">
            <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"><WandSparkles size={20} /></div><div><h2 className="text-xl font-black">Criar nova medalha</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Monte uma conquista reutilizável. O formulário valida o código e mostra o resultado antes de salvar.</p></div></div>
              <button type="button" onClick={fillTemplate} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 text-xs font-black text-blue-800 transition hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200 dark:hover:bg-blue-950/50"><WandSparkles size={15} /> Usar modelo</button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label htmlFor="new-medal-code" className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Código
                <div className="relative mt-2"><input id="new-medal-code" required value={newMedal.code} onBlur={() => setCreateTouched(true)} onChange={(e) => setNewMedal((current) => ({ ...current, code: normalizeMedalCode(e.target.value) }))} placeholder="ex: leitor-atento" aria-invalid={createFieldError(!codeIsValid)} className={`min-h-12 w-full rounded-xl border bg-background px-3.5 py-3 pr-11 text-sm font-semibold normal-case text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-blue-600/20 ${createFieldError(!codeIsValid) ? "border-red-400" : "border-border focus:border-blue-400"}`} />{newMedal.code && <button type="button" onClick={copyMedalCode} aria-label="Copiar código da medalha" className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-blue-700"><Copy size={15} /></button>}</div>
                <span className={`mt-1 block text-[11px] font-semibold ${createFieldError(!codeIsValid) ? "text-red-600" : "text-muted-foreground"}`}>{codeIsValid ? "Use letras minúsculas e hífens." : "Código inválido ou com mais de 64 caracteres."}</span>
              </label>
              <label htmlFor="new-medal-title" className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Título
                <input id="new-medal-title" required value={newMedal.title} onBlur={() => setCreateTouched(true)} onChange={(e) => setNewMedal((current) => ({ ...current, title: e.target.value }))} placeholder="Leitor Atento" aria-invalid={createFieldError(newMedal.title.trim().length < 3)} className={`mt-2 min-h-12 w-full rounded-xl border bg-background px-3.5 py-3 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-blue-600/20 ${createFieldError(newMedal.title.trim().length < 3) ? "border-red-400" : "border-border focus:border-blue-400"}`} />
              </label>
              <div className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Ícone
                <div className="mt-2 flex min-h-12 flex-wrap items-center gap-1.5 rounded-xl border border-border bg-background p-2 shadow-sm"><input aria-label="Ícone da medalha" required maxLength={32} value={newMedal.icon} onChange={(e) => setNewMedal((current) => ({ ...current, icon: e.target.value }))} className="h-8 w-12 rounded-lg bg-muted/50 text-center text-xl text-foreground outline-none focus:ring-2 focus:ring-blue-600/20" />{ICON_OPTIONS.map((icon) => <button key={icon} type="button" onClick={() => setNewMedal((current) => ({ ...current, icon }))} aria-label={`Usar ícone ${icon}`} className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg transition hover:bg-blue-50 dark:hover:bg-blue-950/40 ${newMedal.icon === icon ? "bg-blue-100 ring-2 ring-blue-500/30 dark:bg-blue-950/50" : "bg-transparent"}`}>{icon}</button>)}</div>
              </div>
              <label htmlFor="new-medal-category" className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Categoria
                <select id="new-medal-category" value={newMedal.category} onChange={(e) => setNewMedal((current) => ({ ...current, category: e.target.value }))} className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-600/20"><option value="manual">Manual</option><option value="academic">Acadêmica</option><option value="achievement">Conquista</option><option value="streak">Constância</option></select>
                <span className="mt-1 block text-[11px] font-semibold normal-case tracking-normal text-muted-foreground">{categoryMeta.description}</span>
              </label>
            </div>

            <label htmlFor="new-medal-description" className="mt-5 block text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Descrição
              <textarea id="new-medal-description" required value={newMedal.description} onBlur={() => setCreateTouched(true)} onChange={(e) => setNewMedal((current) => ({ ...current, description: e.target.value }))} maxLength={500} rows={3} placeholder="Explique o que esta medalha reconhece." aria-invalid={createFieldError(newMedal.description.trim().length < 12)} className={`mt-2 w-full resize-y rounded-xl border bg-background px-3.5 py-3 text-sm font-medium leading-6 text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-blue-600/20 ${createFieldError(newMedal.description.trim().length < 12) ? "border-red-400" : "border-border focus:border-blue-400"}`} />
              <span className="mt-1 block text-right text-[11px] font-semibold text-muted-foreground">{newMedal.description.length}/500 · mínimo 12 caracteres</span>
            </label>
            <label htmlFor="new-medal-requirement" className="mt-4 block text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Requisito de concessão
              <textarea id="new-medal-requirement" required value={newMedal.requirement} onBlur={() => setCreateTouched(true)} onChange={(e) => setNewMedal((current) => ({ ...current, requirement: e.target.value }))} maxLength={500} rows={3} placeholder="Descreva quando a medalha deve ser concedida." aria-invalid={createFieldError(newMedal.requirement.trim().length < 12)} className={`mt-2 w-full resize-y rounded-xl border bg-background px-3.5 py-3 text-sm font-medium leading-6 text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-blue-600/20 ${createFieldError(newMedal.requirement.trim().length < 12) ? "border-red-400" : "border-border focus:border-blue-400"}`} />
              <span className="mt-1 block text-right text-[11px] font-semibold text-muted-foreground">{newMedal.requirement.length}/500 · mínimo 12 caracteres</span>
            </label>

            <div className="mt-5 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">{createFormReady ? <CheckCircle2 size={16} className="text-emerald-600" /> : <CircleAlert size={16} className="text-amber-600" />} {createFormReady ? "Pronto para criar" : "Preencha os campos obrigatórios"}</div><Button type="submit" disabled={creating || !createFormReady} className="min-h-11 rounded-xl bg-blue-700 px-6 font-black text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">{creating ? <Loader className="animate-spin" size={16} /> : <PlusCircle size={16} />} Criar medalha</Button></div>
          </form>

          <aside className="surface-card min-w-0 rounded-3xl p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3"><p className="section-kicker text-[10px]">Pré-visualização</p><Eye size={17} className="text-blue-600" /></div>
            <div className="mt-5 rounded-2xl border border-border/70 bg-muted/20 p-5 text-center"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-border/70 bg-card text-5xl shadow-sm">{newMedal.icon || "🏅"}</div><h3 className="mt-4 break-words text-lg font-black text-foreground">{newMedal.title || "Título da medalha"}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{newMedal.description || "A descrição aparecerá aqui."}</p><span className={`mt-4 inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${categoryMeta.tone}`}>{categoryMeta.label}</span></div>
            <div className="mt-4 rounded-2xl border border-border/70 bg-background p-4"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Como será exibido</p><p className="mt-2 text-xs leading-5 text-muted-foreground"><strong className="text-foreground">Requisito:</strong> {newMedal.requirement || "O requisito de concessão aparecerá aqui."}</p><p className="mt-3 text-[11px] font-mono text-muted-foreground">{newMedal.code ? `código: ${newMedal.code}` : "código ainda não definido"}</p></div>
          </aside>
        </section>

        <section className="surface-card rounded-3xl p-5 sm:p-7">
          <div className="flex flex-col gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><UsersRound size={19} className="text-emerald-600" /><h2 className="text-xl font-black">Concessão em lote</h2></div><p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">Selecione vários alunos para atribuir a mesma medalha. Duplicidades são ignoradas com segurança e cada concessão fica registrada.</p></div><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">{selectedBatchUserIds.length} selecionado(s)</span></div>
          <form onSubmit={handleGrantBatch} className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1fr)]">
            <label htmlFor="batch-medal-students" className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Alunos
              <select id="batch-medal-students" multiple value={selectedBatchUserIds} onChange={(e) => setSelectedBatchUserIds(Array.from(e.target.selectedOptions, (option) => option.value))} className="mt-2 h-40 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-600/20">
                {allUsers.map((item) => <option key={item.id} value={item.id}>{item.name || item.email || `Aluno #${item.id}`}</option>)}
              </select>
              <span className="mt-1 block text-[11px] font-semibold normal-case tracking-normal text-muted-foreground">Use Ctrl/Cmd para escolher mais de um aluno.</span>
            </label>
            <label htmlFor="batch-medal-catalog" className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Medalha
              <select id="batch-medal-catalog" value={batchMedalCode} onChange={(e) => setBatchMedalCode(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-600/20"><option value="">Selecione</option>{catalog.map((item) => <option key={item.code} value={item.code}>{item.icon} {item.title} · {CATEGORY_META[item.category]?.label || item.category}</option>)}</select>
              {selectedBatchMedal && <span className="mt-2 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"><span className="text-lg">{selectedBatchMedal.icon}</span>{selectedBatchMedal.title}</span>}
            </label>
            <label htmlFor="batch-medal-notes" className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Justificativa
              <textarea id="batch-medal-notes" required minLength={8} maxLength={500} value={batchNotes} onChange={(e) => setBatchNotes(e.target.value)} rows={5} placeholder="Ex.: participação destacada na atividade de speaking." className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-3.5 py-3 text-sm font-medium leading-6 text-foreground shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-600/20" />
              <span className="mt-1 block text-right text-[11px] font-semibold text-muted-foreground">{batchNotes.length}/500 · mínimo 8</span>
            </label>
            <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between lg:col-span-3"><span className="text-xs text-muted-foreground">A notificação seguirá para cada aluno concedido.</span><Button type="submit" disabled={batchSubmitting || !selectedBatchUserIds.length || !batchMedalCode || batchNotes.trim().length < 8} className="min-h-11 rounded-xl bg-emerald-700 px-6 font-black text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">{batchSubmitting ? <Loader className="animate-spin" size={16} /> : <Sparkles size={16} />} Conceder aos selecionados</Button></div>
          </form>
        </section>

        {/* Catálogo de Medalhas Disponíveis */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-xl font-black">Catálogo Oficial de Medalhas</h2><p className="mt-1 text-xs text-muted-foreground">Cada medalha deve indicar claramente a evidência de aprendizagem ou a justificativa pedagógica da concessão.</p></div><span className="text-xs font-bold text-muted-foreground">{filteredCatalog.length} de {catalog.length} medalhas</span></div>
          <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/20 p-3 sm:grid-cols-[minmax(0,1fr)_11rem]">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} /><input value={catalogQuery} onChange={(event) => setCatalogQuery(event.target.value)} placeholder="Pesquisar por medalha ou critério" aria-label="Pesquisar medalhas" className="min-h-11 w-full rounded-xl border border-border bg-background py-2 pl-10 pr-10 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-red-600" />{catalogQuery && <button type="button" onClick={() => setCatalogQuery("")} className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-600" aria-label="Limpar pesquisa de medalhas"><X size={15} /></button>}</div>
            <select value={catalogCategory} onChange={(event) => setCatalogCategory(event.target.value)} aria-label="Filtrar medalhas por categoria" className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-red-600"><option value="all">Todas as categorias</option>{catalogCategories.map((category) => <option key={category} value={category}>{CATEGORY_META[category]?.label || category}</option>)}</select>
          </div>
          {catalog.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
              <p className="text-base font-black text-foreground">Nenhuma medalha cadastrada</p>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                O catálogo real está vazio. Cadastre e aprove as medalhas institucionais antes de concedê-las aos alunos; nenhuma medalha fictícia é criada automaticamente.
              </p>
            </div>
          ) : filteredCatalog.length === 0 ? <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">Nenhuma medalha corresponde à pesquisa ou à categoria selecionada.</div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalog.map((medal) => (
              <div key={medal.code} className="surface-card interactive-card flex flex-col justify-between rounded-3xl p-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl p-3 bg-muted/60 rounded-2xl shadow-inner">{medal.icon}</span>
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${CATEGORY_META[medal.category]?.tone || "border-border bg-muted text-muted-foreground"}`}>
                      {CATEGORY_META[medal.category]?.label || medal.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-black">{medal.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{medal.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60">
                  <span className="text-[11px] font-bold text-slate-500 block">Requisito:</span>
                  <p className="text-xs font-semibold text-foreground mt-0.5">{medal.requirement}</p>
                </div>
              </div>
            ))}
          </div>}
        </div>

        {/* Histórico de Concessões */}
        <div className="space-y-4">
          <h2 className="text-xl font-black">Histórico de Concessões Recentes</h2>
          <div className="surface-card overflow-hidden rounded-3xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-xs font-bold uppercase text-muted-foreground">
                    <th className="p-4">Aluno</th>
                    <th className="p-4">Medalha</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Justificativa</th>
                    <th className="p-4">Data</th>
                    <th className="p-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {grantedList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                        Nenhuma medalha registrada no histórico ainda.
                      </td>
                    </tr>
                  ) : (
                    grantedList.map((item) => {
                      const medalInfo = catalog.find((m) => m.code === item.medalCode);
                      return (
                        <tr key={item.id} className="hover:bg-muted/30 transition">
                          <td className="p-4 font-bold text-foreground">
                            {item.userName || "Usuário"} <span className="text-xs text-muted-foreground font-normal block">{item.userEmail}</span>
                          </td>
                          <td className="p-4 font-bold flex items-center gap-2">
                            <span>{medalInfo?.icon || "🏅"}</span>
                            <span>{medalInfo?.title || item.medalCode}</span>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${item.grantType === "manual" ? "bg-amber-500/20 text-amber-600 border border-amber-500/30" : "bg-blue-500/20 text-blue-600 border border-blue-500/30"}`}>
                              {item.grantType}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-muted-foreground">{item.notes || "—"}</td>
                          <td className="p-4 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString("pt-BR")}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => void handleRevoke(item)}
                              disabled={revokingId === item.id}
                              aria-label={`Revogar medalha de ${item.userName || item.userEmail}`}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/30"
                            >
                              {revokingId === item.id ? <Loader className="animate-spin" size={14} /> : <Trash2 size={14} />}
                              Revogar
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
