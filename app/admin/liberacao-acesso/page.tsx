"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, KeyRound, ShieldCheck, CheckCircle2, UserCheck, BookOpen, Search, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/hooks/useAuth";

interface GrantRecord {
  id: number;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  courseId: number | null;
  materialId: number | null;
  reason: string;
  createdAt: string;
}

interface UserRecord {
  id: number;
  name: string | null;
  email: string | null;
}

interface CourseRecord {
  id: number;
  title: string;
  price: string | null;
  isFree: boolean;
}

interface MaterialRecord {
  id: number;
  title: string;
  isPublic: boolean;
}

export default function AdminManualAccessPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [grants, setGrants] = useState<GrantRecord[]>([]);
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [coursesList, setCoursesList] = useState<CourseRecord[]>([]);
  const [materialsList, setMaterialsList] = useState<MaterialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [itemType, setItemType] = useState<"course" | "material">("course");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [reason, setReason] = useState("");

  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "course" | "material">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const [successModalData, setSuccessModalData] = useState<{ userName: string; itemTitle: string; reason: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/manual-access", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível carregar os dados de liberação.");
      setGrants(data.grants || []);
      setUsersList(data.users || []);
      setCoursesList(data.courses || []);
      setMaterialsList(data.materials || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao carregar liberações de acesso.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.email?.toLowerCase() !== "palafozanderson@gmail.com") {
      window.location.href = "/";
      return;
    }
    void loadData();
  }, [authLoading, user]);

  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return usersList;
    const q = userSearchQuery.toLowerCase();
    return usersList.filter((u) => (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q)));
  }, [usersList, userSearchQuery]);

  const filteredGrants = useMemo(() => {
    let list = [...grants];
    if (historySearchQuery.trim()) {
      const q = historySearchQuery.toLowerCase();
      list = list.filter((g) => (g.userName && g.userName.toLowerCase().includes(q)) || (g.userEmail && g.userEmail.toLowerCase().includes(q)) || g.reason.toLowerCase().includes(q));
    }
    if (typeFilter === "course") list = list.filter((g) => g.courseId != null);
    if (typeFilter === "material") list = list.filter((g) => g.materialId != null);

    list.sort((a, b) => {
      const tA = new Date(a.createdAt).getTime();
      const tB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? tB - tA : tA - tB;
    });

    return list;
  }, [grants, historySearchQuery, typeFilter, sortBy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error("Selecione um usuário.");
      return;
    }
    if (itemType === "course" && !selectedCourseId) {
      toast.error("Selecione um curso.");
      return;
    }
    if (itemType === "material" && !selectedMaterialId) {
      toast.error("Selecione um material.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Informe uma justificativa.");
      return;
    }

    const targetUserObj = usersList.find((u) => String(u.id) === selectedUserId);
    const itemTitle = itemType === "course"
      ? coursesList.find((c) => String(c.id) === selectedCourseId)?.title || "Curso Pago"
      : materialsList.find((m) => String(m.id) === selectedMaterialId)?.title || "Material Exclusivo";

    try {
      setSaving(true);
      const res = await fetch("/api/admin/manual-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(selectedUserId),
          courseId: itemType === "course" ? Number(selectedCourseId) : null,
          materialId: itemType === "material" ? Number(selectedMaterialId) : null,
          reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao liberar acesso.");

      setSuccessModalData({
        userName: targetUserObj?.name || targetUserObj?.email || "Usuário",
        itemTitle,
        reason,
      });

      setSelectedUserId("");
      setSelectedCourseId("");
      setSelectedMaterialId("");
      setReason("");
      setUserSearchQuery("");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao registrar liberação.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div className="site-shell flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-red-600" size={34} /></div>;
  }
  if (!user || user.email?.toLowerCase() !== "palafozanderson@gmail.com") return null;

  return (
    <div className="site-shell min-h-screen bg-background pb-16 text-foreground">
      <header className="border-b border-border bg-card">
        <div className="page-container py-8">
          <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-red-600"><ArrowLeft size={16} /> Painel administrativo</Link>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Super Admin · Concessão Especial</p><h1 className="mt-2 text-3xl font-black tracking-tight">Liberação manual de conteúdos pagos</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Como super administrador (palafozanderson@gmail.com), libere acesso a qualquer curso ou material pago para contas cadastradas com busca rápida e trilha de auditoria.</p></div>
          </div>
        </div>
      </header>

      <main className="page-container grid gap-6 py-8 lg:grid-cols-[420px_1fr]">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600"><KeyRound size={20} /></div><div><h2 className="font-black">Novo acesso liberado</h2><p className="text-xs text-muted-foreground">Atribuição direta</p></div></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground">Buscar Usuário por Nome ou E-mail</label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-3 text-muted-foreground" size={15} />
                <Input value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)} placeholder="Digite para filtrar alunos..." className="pl-9 text-xs" />
              </div>
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="w-full h-11 rounded-xl border border-border bg-background px-3 text-xs font-semibold" required>
                <option value="">{filteredUsers.length === 0 ? "Nenhum usuário encontrado..." : "Selecione o aluno na lista..."}</option>
                {filteredUsers.map((u) => <option key={u.id} value={u.id}>{u.name || "Sem nome"} ({u.email})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setItemType("course")} className={`rounded-xl py-2.5 text-xs font-black border transition ${itemType === "course" ? "bg-red-600 border-red-600 text-white shadow-sm" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>Liberar Curso</button>
              <button type="button" onClick={() => setItemType("material")} className={`rounded-xl py-2.5 text-xs font-black border transition ${itemType === "material" ? "bg-red-600 border-red-600 text-white shadow-sm" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>Liberar Material</button>
            </div>

            {itemType === "course" ? (
              <div>
                <label className="mb-1 block text-xs font-bold text-muted-foreground">Curso Pago</label>
                <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold" required>
                  <option value="">Selecione o curso...</option>
                  {coursesList.map((c) => <option key={c.id} value={c.id}>{c.title} {c.price ? `(R$ ${c.price})` : ""}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-xs font-bold text-muted-foreground">Material Exclusivo</label>
                <select value={selectedMaterialId} onChange={(e) => setSelectedMaterialId(e.target.value)} className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold" required>
                  <option value="">Selecione o material...</option>
                  {materialsList.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground">Justificativa / Motivo (Obrigatório para Auditoria)</label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex: Cortesia institucional, bolsa de estudos..." required />
            </div>

            <div className="rounded-2xl bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="mb-1 text-emerald-600" size={16} /> O acesso será concedido imediatamente na conta do usuário, registrando a operação em trilha segura.</div>
            <Button type="submit" disabled={saving} className="w-full gap-2 bg-red-600 font-bold text-white hover:bg-red-700">{saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} {saving ? "Liberando..." : "Liberar Acesso Pago"}</Button>
          </form>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="font-black">Histórico de concessões manuais</h2><p className="text-xs text-muted-foreground">Filtre e ordene os registros persistidos</p></div>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">{filteredGrants.length} de {grants.length}</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={14} />
              <Input value={historySearchQuery} onChange={(e) => setHistorySearchQuery(e.target.value)} placeholder="Buscar no histórico..." className="pl-8 text-xs h-10" />
            </div>
            <div>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold">
                <option value="all">Todos os tipos</option>
                <option value="course">Apenas Cursos</option>
                <option value="material">Apenas Materiais</option>
              </select>
            </div>
            <div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold">
                <option value="newest">Mais recentes primeiro</option>
                <option value="oldest">Mais antigos primeiro</option>
              </select>
            </div>
          </div>

          {filteredGrants.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">Nenhum registro encontrado com os filtros atuais.</div>
          ) : (
            <div className="space-y-3 pt-2">
              {filteredGrants.map((g) => (
                <article key={g.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <UserCheck size={15} className="text-red-600" />
                      <span className="text-sm font-black text-foreground">{g.userName || "Usuário"} ({g.userEmail})</span>
                      <span className="rounded-md bg-red-100 dark:bg-red-950/60 px-2 py-0.5 text-[10px] font-black text-red-700 dark:text-red-300">{g.courseId ? "Curso" : "Material"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><BookOpen size={13} /> {g.courseId ? `Curso ID #${g.courseId}` : `Material ID #${g.materialId}`}</p>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 italic">"{g.reason}"</p>
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground shrink-0">{new Date(g.createdAt).toLocaleString("pt-BR")}</span>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {successModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><Sparkles size={24} /></div>
              <button onClick={() => setSuccessModalData(null)} className="rounded-full p-2 text-muted-foreground hover:bg-muted"><X size={18} /></button>
            </div>
            <div>
              <h3 className="text-xl font-black">Acesso Liberado com Sucesso!</h3>
              <p className="mt-1 text-sm text-muted-foreground">O conteúdo foi atribuído à conta do aluno instantaneamente.</p>
            </div>
            <div className="rounded-2xl bg-muted/50 p-4 space-y-2 text-xs">
              <p><strong className="text-foreground">Aluno:</strong> {successModalData.userName}</p>
              <p><strong className="text-foreground">Conteúdo:</strong> {successModalData.itemTitle}</p>
              <p><strong className="text-foreground">Justificativa:</strong> {successModalData.reason}</p>
            </div>
            <Button onClick={() => setSuccessModalData(null)} className="w-full bg-red-600 font-bold text-white hover:bg-red-700">Entendido</Button>
          </div>
        </div>
      )}
    </div>
  );
}
