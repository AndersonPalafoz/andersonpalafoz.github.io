"use client";

import React, { useMemo, useState } from "react";
import { BadgeDollarSign, BookOpenCheck, GraduationCap, ShoppingCart, Users } from "lucide-react";

export interface AdminCommerceData {
  commerceAvailable: boolean;
  salesSummary: {
    totalPurchases: number;
    totalRevenue: number;
    currency: string;
    revenueBasis: "current_course_price" | "unavailable";
    uniqueBuyers: number;
    totalEnrollments: number;
  };
  topSellingCourses: Array<{
    courseId: number;
    title: string;
    purchases: number;
    revenue: number;
  }>;
  recentPurchases: Array<{
    id: number;
    courseId: number;
    courseTitle: string;
    studentId: number;
    studentName: string;
    studentEmail: string;
    amount: number;
    status: "paid";
    purchasedAt: string | Date | null;
  }>;
  recentEnrollments: Array<{
    id: number;
    courseId: number;
    courseTitle: string;
    studentId: number;
    studentName: string;
    studentEmail: string;
    progress: number;
    status: string;
    enrolledAt: string | Date;
  }>;
}

function asDate(value: string | Date | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: string | Date | null | undefined) {
  const date = asDate(value);
  return date ? date.toLocaleDateString("pt-BR") : "Data não informada";
}

function formatCurrency(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);
}

function withinPeriod(value: string | Date | null | undefined, period: string) {
  if (period === "all") return true;
  const date = asDate(value);
  if (!date) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number(period));
  return date >= cutoff;
}

export function AdminCommerceMonitor({ data }: { data?: AdminCommerceData | null }) {
  const [period, setPeriod] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const recentPurchases = data?.recentPurchases || [];
  const recentEnrollments = data?.recentEnrollments || [];

  const courseOptions = useMemo(() => {
    const courses = new Map<number, string>();
    [...recentPurchases, ...recentEnrollments].forEach((item) => courses.set(item.courseId, item.courseTitle));
    return Array.from(courses.entries()).sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  }, [recentPurchases, recentEnrollments]);

  const filteredPurchases = useMemo(() => recentPurchases.filter((purchase) => {
    const matchesCourse = courseFilter === "all" || String(purchase.courseId) === courseFilter;
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter;
    return matchesCourse && matchesStatus && withinPeriod(purchase.purchasedAt, period);
  }), [courseFilter, recentPurchases, period, statusFilter]);

  const filteredEnrollments = useMemo(() => recentEnrollments.filter((enrollment) => {
    const matchesCourse = courseFilter === "all" || String(enrollment.courseId) === courseFilter;
    return matchesCourse && withinPeriod(enrollment.enrolledAt, period);
  }), [courseFilter, recentEnrollments, period]);

  const filteredRevenue = filteredPurchases.reduce((total, purchase) => total + purchase.amount, 0);
  const filteredBuyers = new Set(filteredPurchases.map((purchase) => purchase.studentId)).size;
  const filteredTopSellingCourses = useMemo(() => {
    const courses = new Map<number, { courseId: number; title: string; purchases: number; revenue: number }>();
    filteredPurchases.forEach((purchase) => {
      const current = courses.get(purchase.courseId) || { courseId: purchase.courseId, title: purchase.courseTitle, purchases: 0, revenue: 0 };
      current.purchases += 1;
      current.revenue += purchase.amount;
      courses.set(purchase.courseId, current);
    });
    return Array.from(courses.values()).sort((a, b) => b.purchases - a.purchases || b.revenue - a.revenue).slice(0, 5);
  }, [filteredPurchases]);

  return (
    <section aria-labelledby="commerce-monitor-title" className="surface-card space-y-6 p-6 sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <BadgeDollarSign size={16} /> Vendas & Matrículas
          </div>
          <h2 id="commerce-monitor-title" className="text-xl font-black text-foreground sm:text-2xl">Monitoramento comercial e acadêmico</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Acompanhe pagamentos confirmados pelo Stripe e o acesso dos alunos aos cursos, usando somente registros associados ao banco administrativo.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <label className="text-xs font-bold text-muted-foreground">
            Período
            <select value={period} onChange={(event) => setPeriod(event.target.value)} className="mt-1 min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary sm:min-w-32">
              <option value="all">Todo o período</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
            </select>
          </label>
          <label className="text-xs font-bold text-muted-foreground">
            Curso
            <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className="mt-1 min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary sm:min-w-44">
              <option value="all">Todos os cursos</option>
              {courseOptions.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-muted-foreground">
            Compra
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="mt-1 min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary sm:min-w-32">
              <option value="all">Todos os status</option>
              <option value="paid">Pagas</option>
            </select>
          </label>
        </div>
      </div>

      {!data.commerceAvailable && (
        <div role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
          Os dados comerciais não puderam ser consultados neste momento. Nenhum valor foi estimado ou inventado; tente novamente após verificar a conexão do banco.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-background p-5"><div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Receita de referência</span><BadgeDollarSign className="text-emerald-600" size={20} /></div><strong className="mt-2 block text-2xl font-black text-foreground">{formatCurrency(filteredRevenue)}</strong><span className="mt-1 block text-xs text-muted-foreground">Preço atual associado às compras</span></div>
        <div className="rounded-2xl border border-border bg-background p-5"><div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Vendas pagas</span><ShoppingCart className="text-red-600" size={20} /></div><strong className="mt-2 block text-2xl font-black text-foreground">{filteredPurchases.length}</strong><span className="mt-1 block text-xs text-muted-foreground">Pagamentos confirmados</span></div>
        <div className="rounded-2xl border border-border bg-background p-5"><div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Compradores</span><Users className="text-blue-600" size={20} /></div><strong className="mt-2 block text-2xl font-black text-foreground">{filteredBuyers}</strong><span className="mt-1 block text-xs text-muted-foreground">Alunos únicos no filtro</span></div>
        <div className="rounded-2xl border border-border bg-background p-5"><div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Matrículas</span><GraduationCap className="text-amber-600" size={20} /></div><strong className="mt-2 block text-2xl font-black text-foreground">{filteredEnrollments.length}</strong><span className="mt-1 block text-xs text-muted-foreground">Acessos no filtro</span></div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-black text-foreground">Cursos mais vendidos</h3><BookOpenCheck className="text-primary" size={19} /></div>
          {filteredTopSellingCourses.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma venda encontrada para os filtros selecionados.</p> : <div className="space-y-3">{filteredTopSellingCourses.map((course) => <div key={course.courseId} className="rounded-xl border border-border/70 p-3"><div className="flex items-start justify-between gap-3"><p className="text-sm font-bold text-foreground">{course.title}</p><span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-xs font-black text-primary">{course.purchases} venda(s)</span></div><p className="mt-1 text-xs text-muted-foreground">{formatCurrency(course.revenue)}</p></div>)}</div>}
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-black text-foreground">Últimas vendas confirmadas</h3><ShoppingCart className="text-red-600" size={19} /></div>
          {filteredPurchases.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma compra encontrada para os filtros selecionados.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="pb-3 pr-4">Aluno</th><th className="pb-3 pr-4">Curso</th><th className="pb-3 pr-4">Valor</th><th className="pb-3">Data</th></tr></thead><tbody className="divide-y divide-border">{filteredPurchases.slice(0, 10).map((purchase) => <tr key={purchase.id}><td className="py-3 pr-4"><p className="font-bold text-foreground">{purchase.studentName}</p><p className="text-xs text-muted-foreground">{purchase.studentEmail}</p></td><td className="py-3 pr-4 text-muted-foreground">{purchase.courseTitle}</td><td className="py-3 pr-4 font-bold text-foreground">{formatCurrency(purchase.amount)}</td><td className="py-3 text-muted-foreground">{formatDate(purchase.purchasedAt)}</td></tr>)}</tbody></table></div>}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-5">
        <div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="font-black text-foreground">Alunos matriculados</h3><p className="mt-1 text-xs text-muted-foreground">Lista operacional de acessos e progresso.</p></div><GraduationCap className="text-amber-600" size={19} /></div>
        {filteredEnrollments.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma matrícula encontrada para os filtros selecionados.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="pb-3 pr-4">Aluno</th><th className="pb-3 pr-4">Curso</th><th className="pb-3 pr-4">Progresso</th><th className="pb-3 pr-4">Status</th><th className="pb-3">Data</th></tr></thead><tbody className="divide-y divide-border">{filteredEnrollments.slice(0, 20).map((enrollment) => <tr key={enrollment.id}><td className="py-3 pr-4"><p className="font-bold text-foreground">{enrollment.studentName}</p><p className="text-xs text-muted-foreground">{enrollment.studentEmail}</p></td><td className="py-3 pr-4 text-muted-foreground">{enrollment.courseTitle}</td><td className="py-3 pr-4"><div className="flex min-w-28 items-center gap-2"><div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, enrollment.progress))}%` }} /></div><span className="text-xs font-black text-foreground">{enrollment.progress}%</span></div></td><td className="py-3 pr-4"><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">{enrollment.status}</span></td><td className="py-3 text-muted-foreground">{formatDate(enrollment.enrolledAt)}</td></tr>)}</tbody></table></div>}
      </div>
    </section>
  );
}
