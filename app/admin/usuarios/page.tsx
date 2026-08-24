"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  Clock3,
  Download,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SUPER_ADMIN_EMAIL = "palafozanderson@gmail.com";

type Role = "user" | "professor" | "admin";
type ApprovalStatus = "pending" | "approved" | "rejected";
type StatusFilter = "all" | ApprovalStatus | "deleted";

interface User {
  id: number;
  name: string | null;
  socialName: string | null;
  cpf: string | null;
  email: string | null;
  role: Role;
  approvalStatus: ApprovalStatus;
  teacherId: number | null;
  deletedAt: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  loginMethod: string | null;
  createdAt: string;
  updatedAt: string;
  lastSignedIn: string;
}


const statusLabels: Record<ApprovalStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Recusado",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}

function statusClasses(status: ApprovalStatus, deletedAt: string | null) {
  if (deletedAt) return "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400";
  if (status === "approved") return "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300";
  if (status === "rejected") return "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300";
  return "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300";
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [formData, setFormData] = useState<{ email: string; name: string; role: Role }>({
    email: "",
    name: "",
    role: "user",
  });
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao carregar usuários.");
      setUsers(data.users);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  useEffect(() => {
    // Carregar lista de professores para atribuição
    const loadTeachers = async () => {
      try {
        const res = await fetch("/api/admin/users", { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data.users) {
          setTeachers(data.users.filter((u: User) => (u.role === "professor" || u.role === "admin") && !u.deletedAt));
        }
      } catch (e) {}
    };
    void loadTeachers();
  }, [users]);

  const updateUser = async (userId: number, payload: Record<string, unknown>, successMessage: string) => {
    try {
      setBusyId(userId);
      setFeedback(null);
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...payload }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível atualizar o usuário.");
      setUsers((current) => current.map((user) => (user.id === userId ? data.user : user)));
      setFeedback(successMessage);
      toast.success(successMessage);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível atualizar o usuário.";
      setError(message);
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.email || !formData.name) {
      setError("Informe nome e email para criar a conta.");
      return;
    }

    try {
      setCreating(true);
      setError(null);
      const response = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível criar o usuário.");
      setFormData({ email: "", name: "", role: "user" });
      setShowCreateForm(false);
      setFeedback("Usuário criado com acesso aprovado e progresso inicial zerado.");
      toast.success("Usuário criado com acesso aprovado.");
      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível criar o usuário.";
      setError(message);
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (user.email?.toLowerCase() === SUPER_ADMIN_EMAIL) return;
    if (!window.confirm(`Excluir logicamente a conta de ${user.name || user.email}?`)) return;

    try {
      setBusyId(user.id);
      setFeedback(null);
      const response = await fetch(`/api/admin/users?id=${user.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível excluir o usuário.");
      setUsers((current) => current.map((item) => (item.id === user.id ? data.user : item)));
      setFeedback("Usuário excluído logicamente. O histórico foi preservado.");
      toast.success("Conta excluída logicamente. O histórico foi preservado.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível excluir o usuário.";
      setError(message);
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  };

  const handleRestore = async (user: User) => {
    await updateUser(user.id, { action: "restore" }, "Usuário recuperado com sucesso.");
  };

  const filteredUsers = useMemo(() => {
    const rawQuery = query.trim().toLowerCase();
    const cleanQueryQuery = rawQuery.replace(/\D/g, "");
    return users.filter((user) => {
      const cleanUserCpf = (user.cpf || "").replace(/\D/g, "");
      const matchesCpf = cleanQueryQuery.length > 0 && cleanUserCpf.includes(cleanQueryQuery);
      const matchesText = !rawQuery || [user.name, user.socialName, user.email, user.phone]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(rawQuery));
      const matchesQuery = !rawQuery || matchesText || matchesCpf;
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all"
        || (statusFilter === "deleted" ? Boolean(user.deletedAt) : !user.deletedAt && user.approvalStatus === statusFilter);
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [query, roleFilter, statusFilter, users]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const pendingCount = users.filter((user) => !user.deletedAt && user.approvalStatus === "pending").length;
  const approvedCount = users.filter((user) => !user.deletedAt && user.approvalStatus === "approved").length;
  const deletedCount = users.filter((user) => Boolean(user.deletedAt)).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">Super-admin</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Usuários e aprovações</h1>
            <p className="mt-2 max-w-2xl text-gray-600 dark:text-slate-400">Aprove novos cadastros, gerencie papéis e preserve o histórico de contas sem exclusões permanentes.</p>
          </div>
          <Button onClick={() => setShowCreateForm((current) => !current)} className="bg-red-600 text-white hover:bg-red-700">
            <Plus size={17} className="mr-2" />
            Criar usuário
          </Button>
        </div>

        {feedback && <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">{feedback}</div>}
        {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</div>}

        {showCreateForm && (
          <form onSubmit={handleCreateUser} className="mb-8 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Criar conta administrativamente</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Contas criadas por você entram aprovadas; alunos começam com 0% de progresso.</p>
              </div>
              <button type="button" onClick={() => setShowCreateForm(false)} className="rounded-lg p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 hover:text-gray-900" aria-label="Fechar formulário">
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Nome<input required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="mt-2 h-12 w-full rounded-xl border border-gray-300 dark:border-slate-700 px-3 font-normal outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100" /></label>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Email<input required type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className="mt-2 h-12 w-full rounded-xl border border-gray-300 dark:border-slate-700 px-3 font-normal outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100" /></label>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Papel<select value={formData.role} onChange={(event) => setFormData({ ...formData, role: event.target.value as Role })} className="mt-2 h-12 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 font-normal outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100"><option value="user">Aluno</option><option value="professor">Professor</option><option value="admin">Administrador</option></select></label>
            </div>
            <div className="mt-5 flex justify-end"><Button type="submit" disabled={creating} className="bg-red-600 text-white hover:bg-red-700">{creating ? "Criando…" : "Criar conta"}</Button></div>
          </form>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><div className="flex items-center justify-between"><span className="text-sm font-medium text-amber-800">Aguardando análise</span><Clock3 size={19} className="text-amber-700" /></div><p className="mt-2 text-3xl font-bold text-amber-900">{pendingCount}</p></div>
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5"><div className="flex items-center justify-between"><span className="text-sm font-medium text-green-800">Contas aprovadas</span><ShieldCheck size={19} className="text-green-700" /></div><p className="mt-2 text-3xl font-bold text-green-900">{approvedCount}</p></div>
          <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"><div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-600 dark:text-slate-400">Excluídas logicamente</span><Trash2 size={19} className="text-gray-500 dark:text-slate-400" /></div><p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{deletedCount}</p></div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-slate-800 p-5 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block flex-1 lg:max-w-sm"><span className="sr-only">Pesquisar usuários</span><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, CPF, email ou telefone" className="h-11 w-full rounded-xl border border-gray-300 dark:border-slate-700 pl-10 pr-3 text-sm outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100" /></label>
            <div className="w-full md:hidden">
              <details className="group rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 p-3">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-black text-gray-800 dark:text-slate-200">Filtros e ferramentas <span className="rounded-full bg-white dark:bg-slate-900 px-2 py-1 text-[10px] text-gray-500 dark:text-slate-400">{[roleFilter !== "all", statusFilter !== "all"].filter(Boolean).length} ativo(s)</span></summary>
                <div className="mt-3 grid gap-2">
                  <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as "all" | Role)} className="h-11 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-gray-700 dark:text-slate-300 outline-none focus:border-red-600"><option value="all">Todos os papéis</option><option value="user">Alunos</option><option value="professor">Professores</option><option value="admin">Administradores</option></select>
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="h-11 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-gray-700 dark:text-slate-300 outline-none focus:border-red-600"><option value="all">Todos os status</option><option value="pending">Pendentes</option><option value="approved">Aprovados</option><option value="rejected">Recusados</option><option value="deleted">Excluídos</option></select>
                  <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => void fetchUsers()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-slate-700 px-3 text-sm font-semibold text-gray-700 dark:text-slate-300 transition hover:border-red-600 hover:text-red-600" aria-label="Atualizar lista"><RefreshCw size={16} />Atualizar</button><a href="/api/admin/export-users" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 shadow-sm" download><Download size={16} />CSV</a></div>
                </div>
              </details>
            </div>
            <div className="hidden flex-wrap gap-2 md:flex">
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as "all" | Role)} className="h-11 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-gray-700 dark:text-slate-300 outline-none focus:border-red-600"><option value="all">Todos os papéis</option><option value="user">Alunos</option><option value="professor">Professores</option><option value="admin">Administradores</option></select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="h-11 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-gray-700 dark:text-slate-300 outline-none focus:border-red-600"><option value="all">Todos os status</option><option value="pending">Pendentes</option><option value="approved">Aprovados</option><option value="rejected">Recusados</option><option value="deleted">Excluídos</option></select>
              <button type="button" onClick={() => void fetchUsers()} className="inline-flex h-11 items-center gap-2 rounded-xl border border-gray-300 dark:border-slate-700 px-3 text-sm font-semibold text-gray-700 dark:text-slate-300 transition hover:border-red-600 hover:text-red-600" aria-label="Atualizar lista"><RefreshCw size={16} />Atualizar</button>
              <a href="/api/admin/export-users" className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 shadow-sm" download><Download size={16} />Exportar CSV</a>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-6"><div className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-slate-800" /><div className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-slate-800" /><div className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-slate-800" /></div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-16 text-center"><UserRound size={32} className="mx-auto text-gray-300 dark:text-slate-600" /><p className="mt-3 font-semibold text-gray-900 dark:text-white">Nenhum usuário encontrado</p><p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Ajuste os filtros ou aguarde novos cadastros.</p></div>
          ) : (
            <>
              <div className="divide-y divide-gray-100 dark:divide-slate-800 md:hidden">
                {paginatedUsers.map((user) => {
                  const isPrincipal = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
                  const isBusy = busyId === user.id;
                  return (
                    <article key={user.id} className={`space-y-4 p-4 ${user.deletedAt ? "bg-gray-50/80 dark:bg-slate-900/40" : "bg-white dark:bg-slate-900"}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 font-bold text-red-700">{(user.name || user.email || "?").slice(0, 1).toUpperCase()}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2"><p className="truncate font-bold text-gray-900 dark:text-white">{user.name || "Sem nome"}</p>{isPrincipal && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-700">Principal</span>}</div>
                          <p className="truncate text-xs text-gray-500 dark:text-slate-400">{user.email || "Email não informado"}</p>
                          <p className="mt-1 text-[11px] text-gray-400 dark:text-slate-500">Cadastro: {formatDate(user.createdAt)} · Último acesso: {formatDate(user.lastSignedIn)}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClasses(user.approvalStatus, user.deletedAt)}`}>{user.deletedAt ? "Excluído" : statusLabels[user.approvalStatus]}</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <label className="text-[10px] font-black uppercase tracking-wide text-gray-500 dark:text-slate-400">Papel<select value={user.role} disabled={isPrincipal || isBusy || Boolean(user.deletedAt)} onChange={(event) => void updateUser(user.id, { role: event.target.value }, "Papel atualizado com sucesso.")} className="mt-1 h-10 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs font-semibold text-gray-700 dark:text-slate-300 outline-none focus:border-red-600 disabled:bg-gray-100"><option value="user">Aluno</option><option value="professor">Professor</option><option value="admin">Administrador</option></select></label>
                        {user.role === "user" ? <label className="text-[10px] font-black uppercase tracking-wide text-gray-500 dark:text-slate-400">Professor responsável<select value={user.teacherId ?? ""} disabled={isBusy || Boolean(user.deletedAt)} onChange={(event) => void updateUser(user.id, { teacherId: event.target.value ? Number(event.target.value) : null }, "Professor responsável atualizado.")} className="mt-1 h-10 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs font-semibold text-gray-700 dark:text-slate-300 outline-none focus:border-red-600 disabled:bg-gray-100"><option value="">Nenhum</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name || teacher.email}</option>)}</select></label> : <div className="rounded-xl bg-gray-50 dark:bg-slate-900/50 px-3 py-2 text-[11px] text-gray-500 dark:text-slate-400">Sem professor responsável</div>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {user.deletedAt ? (
                          <Button size="sm" variant="outline" disabled={isBusy} onClick={() => void handleRestore(user)} className="min-h-10 flex-1 gap-1.5 border-green-200 text-green-700"><RefreshCw size={15} />Recuperar</Button>
                        ) : (
                          <>
                            {user.approvalStatus === "pending" ? (
                              <>
                                <Button size="sm" disabled={isBusy} onClick={() => void updateUser(user.id, { approvalStatus: "approved" }, "Conta aprovada com sucesso.")} className="min-h-10 flex-1 gap-1.5 bg-green-600 text-white hover:bg-green-700"><Check size={15} />Aprovar</Button>
                                <Button size="sm" variant="outline" disabled={isBusy} onClick={() => void updateUser(user.id, { approvalStatus: "rejected" }, "Solicitação recusada.")} className="min-h-10 flex-1 gap-1.5 border-red-200 text-red-700"><X size={15} />Recusar</Button>
                              </>
                            ) : null}
                            {user.approvalStatus === "rejected" ? <Button size="sm" variant="outline" disabled={isBusy} onClick={() => void updateUser(user.id, { approvalStatus: "approved" }, "Conta aprovada com sucesso.")} className="min-h-10 flex-1 gap-1.5 border-green-200 text-green-700"><Check size={15} />Liberar</Button> : null}
                            {!isPrincipal ? <Button size="sm" variant="ghost" disabled={isBusy} onClick={() => void handleDelete(user)} className="min-h-10 gap-1.5 text-red-600" aria-label={`Excluir ${user.name || user.email}`}><Trash2 size={16} />Excluir</Button> : null}
                          </>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[980px] text-left">
                <thead className="bg-gray-50 dark:bg-slate-900/50 text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400"><tr><th className="px-5 py-4 font-semibold">Usuário</th><th className="px-5 py-4 font-semibold">Papel</th><th className="px-5 py-4 font-semibold">Professor Responsável</th><th className="px-5 py-4 font-semibold">Acesso</th><th className="px-5 py-4 text-right font-semibold">Ações</th></tr></thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {paginatedUsers.map((user) => {
                    const isPrincipal = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
                    const isBusy = busyId === user.id;
                    return <tr key={user.id} className={user.deletedAt ? "bg-gray-50/80 dark:bg-slate-900/40" : "hover:bg-gray-50/70 dark:hover:bg-slate-800/50"}>
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 font-semibold text-red-700">{(user.name || user.email || "?").slice(0, 1).toUpperCase()}</div><div><p className="font-semibold text-gray-900 dark:text-white">{user.name || "Sem nome"}{isPrincipal && <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">Principal</span>}</p><p className="text-sm text-gray-500 dark:text-slate-400">{user.email || "Email não informado"}</p></div></div></td>
                      <td className="px-5 py-4"><select value={user.role} disabled={isPrincipal || isBusy || Boolean(user.deletedAt)} onChange={(event) => void updateUser(user.id, { role: event.target.value }, "Papel atualizado com sucesso.")} className="h-10 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm font-medium text-gray-700 dark:text-slate-300 outline-none focus:border-red-600 disabled:cursor-not-allowed disabled:bg-gray-100"><option value="user">Aluno</option><option value="professor">Professor</option><option value="admin">Administrador</option></select></td>
                      <td className="px-5 py-4">{user.role === "user" ? (<select value={user.teacherId ?? ""} disabled={isBusy || Boolean(user.deletedAt)} onChange={(event) => void updateUser(user.id, { teacherId: event.target.value ? Number(event.target.value) : null }, "Professor responsável atualizado.")} className="h-10 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm font-medium text-gray-700 dark:text-slate-300 outline-none focus:border-red-600 disabled:cursor-not-allowed disabled:bg-gray-100"><option value="">Nenhum</option>{teachers.map((t) => (<option key={t.id} value={t.id}>{t.name || t.email}</option>))}</select>) : (<span className="text-xs text-gray-400 dark:text-slate-500">—</span>)}</td>
                      <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(user.approvalStatus, user.deletedAt)}`}>{user.deletedAt ? "Excluído" : statusLabels[user.approvalStatus]}</span></td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-400">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-2">{user.deletedAt ? <Button size="sm" variant="outline" disabled={isBusy} onClick={() => void handleRestore(user)} className="gap-1.5 border-green-200 text-green-700 hover:bg-green-50"><RefreshCw size={15} />Recuperar</Button> : <>{user.approvalStatus === "pending" && <><Button size="sm" disabled={isBusy} onClick={() => void updateUser(user.id, { approvalStatus: "approved" }, "Conta aprovada com sucesso.")} className="gap-1.5 bg-green-600 text-white hover:bg-green-700"><Check size={15} />Aprovar</Button><Button size="sm" variant="outline" disabled={isBusy} onClick={() => void updateUser(user.id, { approvalStatus: "rejected" }, "Solicitação recusada.")} className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50"><X size={15} />Recusar</Button></>}{user.approvalStatus === "rejected" && <Button size="sm" variant="outline" disabled={isBusy} onClick={() => void updateUser(user.id, { approvalStatus: "approved" }, "Conta aprovada com sucesso.")} className="gap-1.5 border-green-200 text-green-700 hover:bg-green-50"><Check size={15} />Liberar</Button>}{!isPrincipal && <Button size="sm" variant="ghost" disabled={isBusy} onClick={() => void handleDelete(user)} className="text-red-600 hover:bg-red-50 hover:text-red-700" aria-label={`Excluir ${user.name || user.email}`}><Trash2 size={16} /></Button>}</>}</div></td>
                    </tr>;
                  })}
                </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Mostrando {(currentPage - 1) * pageSize + 1} a {Math.min(filteredUsers.length, currentPage * pageSize)} de {filteredUsers.length} usuários (Total: {users.length})
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Próxima
            </Button>
            <Link href="/admin">
              <Button variant="outline" className="gap-2 ml-2">
                <ChevronDown size={16} className="rotate-90" />
                Voltar para o painel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
