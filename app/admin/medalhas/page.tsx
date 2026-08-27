"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Award, ArrowLeft, PlusCircle, ShieldCheck, Sparkles, Loader, Search, X } from "lucide-react";
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

      if (!res.ok) throw new Error("Erro ao conceder medalha");

      toast.success("Medalha concedida com sucesso ao aluno!");
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
    <div className="site-shell min-h-screen bg-background text-foreground pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white px-6 py-8 shadow-xl">
        <div className="page-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin" className="text-xs text-red-400 hover:text-red-300 font-bold inline-flex items-center gap-1">
                <ArrowLeft size={14} /> Voltar ao Painel Admin
              </Link>
            </div>
            <h1 className="text-3xl font-black flex items-center gap-3">
              <Award className="text-red-500" size={32} /> Gestão de Medalhas & Conquistas
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Visualize o catálogo completo de medalhas e conceda conquistas manualmente para alunos destacados.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/15 backdrop-blur-md">
            <ShieldCheck className="text-amber-400" size={20} />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Acesso Administrativo</span>
          </div>
        </div>
      </div>

      <div className="page-container py-8 space-y-8">
        {/* Formulário de Concessão Manual */}
        <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center">
              <PlusCircle size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black">Conceder Medalha Manualmente</h2>
              <p className="text-xs text-muted-foreground">Selecione um aluno e a medalha desejada para premiar o esforço acadêmico.</p>
            </div>
          </div>

          <form onSubmit={handleGrantMedal} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Aluno Destinatário</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="">Selecione um aluno...</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || "Sem Nome"} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Medalha do Catálogo</label>
              <select
                value={selectedMedalCode}
                onChange={(e) => setSelectedMedalCode(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="">Selecione uma medalha...</option>
                {catalog.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.icon} {m.title} ({m.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Justificativa pedagógica</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
                minLength={8}
                placeholder="Ex: participação qualificada na aula de conversação B1"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black px-8 py-3 rounded-xl shadow-lg transition transform active:scale-95 flex items-center gap-2"
              >
                {submitting ? <Loader className="animate-spin" size={18} /> : <Sparkles size={18} />}
                Conceder Medalha ao Aluno
              </Button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-6">
          <form onSubmit={handleCreateMedal} className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div>
              <h2 className="text-xl font-black">Criar nova medalha</h2>
              <p className="text-xs text-muted-foreground mt-1">Cadastre uma conquista reutilizável no catálogo. O código deve ser único e no formato palavra-palavra.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Código
                <input required value={newMedal.code} onChange={(e) => setNewMedal((v) => ({ ...v, code: e.target.value.toLowerCase().replace(/\\s+/g, "-") }))} placeholder="ex: leitor-atento" className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm normal-case font-semibold text-foreground" />
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Título
                <input required value={newMedal.title} onChange={(e) => setNewMedal((v) => ({ ...v, title: e.target.value }))} placeholder="Leitor Atento" className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm normal-case font-semibold text-foreground" />
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ícone
                <input required maxLength={32} value={newMedal.icon} onChange={(e) => setNewMedal((v) => ({ ...v, icon: e.target.value }))} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-2xl text-foreground" />
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categoria
                <select value={newMedal.category} onChange={(e) => setNewMedal((v) => ({ ...v, category: e.target.value }))} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground">
                  <option value="manual">Manual</option><option value="academic">Acadêmica</option><option value="achievement">Conquista</option><option value="streak">Constância</option>
                </select>
              </label>
            </div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Descrição
              <textarea required value={newMedal.description} onChange={(e) => setNewMedal((v) => ({ ...v, description: e.target.value }))} rows={2} placeholder="Explique o que esta medalha reconhece." className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground" />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Requisito
              <textarea required value={newMedal.requirement} onChange={(e) => setNewMedal((v) => ({ ...v, requirement: e.target.value }))} rows={2} placeholder="Descreva quando a medalha deve ser concedida." className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground" />
            </label>
            <div className="flex justify-end"><Button type="submit" disabled={creating} className="bg-slate-900 text-white font-black rounded-xl">{creating ? <Loader className="animate-spin" size={16} /> : <PlusCircle size={16} />} Criar medalha</Button></div>
          </form>
          <div className="rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-6 shadow-sm dark:border-red-900/40 dark:from-red-950/30 dark:to-card">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Pré-visualização</p>
            <div className="mt-5 text-center"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-5xl shadow-md dark:bg-slate-900">{newMedal.icon || "🏅"}</div><h3 className="mt-4 text-lg font-black">{newMedal.title || "Título da medalha"}</h3><p className="mt-2 text-xs leading-5 text-muted-foreground">{newMedal.description || "A descrição aparecerá aqui."}</p><span className="mt-4 inline-flex rounded-full bg-red-600/10 px-3 py-1 text-[10px] font-black uppercase text-red-700">{newMedal.category}</span></div>
          </div>
        </div>

        <form onSubmit={handleGrantBatch} className="bg-card border border-border/70 rounded-3xl p-6 shadow-xl space-y-4">
          <div><h2 className="text-xl font-black">Concessão em lote</h2><p className="text-sm text-muted-foreground">Selecione vários alunos para atribuir a mesma medalha. Alunos que já possuem a conquista são ignorados com segurança.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Alunos
              <select multiple value={selectedBatchUserIds} onChange={(e) => setSelectedBatchUserIds(Array.from(e.target.selectedOptions, (option) => option.value))} className="mt-2 h-36 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground">
                {allUsers.map((item) => <option key={item.id} value={item.id}>{item.name || item.email || `Aluno #${item.id}`}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Medalha
              <select value={batchMedalCode} onChange={(e) => setBatchMedalCode(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground"><option value="">Selecione</option>{catalog.map((item) => <option key={item.code} value={item.code}>{item.icon} {item.title}</option>)}</select>
            </label>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Justificativa
              <textarea required minLength={8} value={batchNotes} onChange={(e) => setBatchNotes(e.target.value)} rows={5} placeholder="Ex: participação destacada na atividade de speaking" className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground" />
            </label>
          </div>
          <div className="flex justify-end"><Button type="submit" disabled={batchSubmitting} className="rounded-xl bg-red-600 font-black text-white">{batchSubmitting ? <Loader className="animate-spin" size={16} /> : <Sparkles size={16} />} Conceder aos selecionados</Button></div>
        </form>

        {/* Catálogo de Medalhas Disponíveis */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-xl font-black">Catálogo Oficial de Medalhas</h2><p className="mt-1 text-xs text-muted-foreground">Cada medalha deve indicar claramente a evidência de aprendizagem ou a justificativa pedagógica da concessão.</p></div><span className="text-xs font-bold text-muted-foreground">{filteredCatalog.length} de {catalog.length} medalhas</span></div>
          <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/20 p-3 sm:grid-cols-[minmax(0,1fr)_11rem]">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} /><input value={catalogQuery} onChange={(event) => setCatalogQuery(event.target.value)} placeholder="Pesquisar por medalha ou critério" aria-label="Pesquisar medalhas" className="min-h-11 w-full rounded-xl border border-border bg-background py-2 pl-10 pr-10 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-red-600" />{catalogQuery && <button type="button" onClick={() => setCatalogQuery("")} className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-600" aria-label="Limpar pesquisa de medalhas"><X size={15} /></button>}</div>
            <select value={catalogCategory} onChange={(event) => setCatalogCategory(event.target.value)} aria-label="Filtrar medalhas por categoria" className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-red-600"><option value="all">Todas as categorias</option>{catalogCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select>
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
              <div key={medal.code} className="bg-card border border-border/70 rounded-3xl p-6 shadow-md flex flex-col justify-between hover:shadow-lg transition">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl p-3 bg-muted/60 rounded-2xl shadow-inner">{medal.icon}</span>
                    <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-red-600/10 text-red-600 border border-red-600/20">
                      {medal.category}
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
          <div className="bg-card border border-border/70 rounded-3xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-xs font-bold uppercase text-muted-foreground">
                    <th className="p-4">Aluno</th>
                    <th className="p-4">Medalha</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Justificativa</th>
                    <th className="p-4">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {grantedList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
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
