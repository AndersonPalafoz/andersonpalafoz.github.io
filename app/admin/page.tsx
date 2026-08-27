"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, BookOpen, FileText, Users, Loader, Award, ShieldCheck, GraduationCap } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { canAccessAdminPortal, getEffectiveRole, isSuperadmin, roleLabel } from "@/lib/role-capabilities";
import { AdminSearchWidget } from "@/components/admin-search-widget";
import { StudentStyleDashboardStats } from "@/components/student-style-dashboard-stats";
import { AdminCommerceMonitor, type AdminCommerceData } from "@/components/admin-commerce-monitor";
import { AdminActionCenter } from "@/components/admin-action-center";
import { AdminModerationHub } from "@/components/admin-moderation-hub";
import { AdminCapabilityMap } from "@/components/admin-capability-map";
import { useRolePreview } from "@/components/role-preview";
import { SuperadminControlCenter } from "@/components/superadmin-control-center";

interface Stats {
  totalCourses: number;
  totalMaterials: number;
  totalArticles: number;
  totalUsers: number;
  totalEnrollments: number;
  roleCounts: {
    admin: number;
    professor: number;
    student: number;
  };
  monthlyActivity: Array<{
    month: string;
    enrollments: number;
    activeUsers: number;
    coursesCreated?: number;
  }>;
  commerce: AdminCommerceData | null;
}

function MonthlyActivityChart({ data }: { data: Stats["monthlyActivity"] }) {
  const maxValue = Math.max(1, ...data.flatMap((item) => [item.enrollments, item.coursesCreated || 0]));
  const chartHeight = 200;
  const chartWidth = 720;
  const groupWidth = data.length > 0 ? chartWidth / data.length : chartWidth;

  return (
    <div className="w-full min-w-0 overflow-hidden py-2">
      <div className="w-full min-w-0">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="block w-full max-w-full h-auto">
          <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="currentColor" className="text-border" strokeWidth="1" />
          {data.map((item, index) => {
            const barWidth = Math.min(26, groupWidth / 3);
            const enrHeight = (item.enrollments / maxValue) * (chartHeight - 20);
            const courseHeight = ((item.coursesCreated || 0) / maxValue) * (chartHeight - 20);

            return (
              <g key={index} transform={`translate(${index * groupWidth}, 0)`}>
                {/* Barra de Matrículas */}
                <rect
                  x={groupWidth / 2 - barWidth - 6}
                  y={chartHeight - enrHeight}
                  width={barWidth}
                  height={enrHeight}
                  rx="6"
                  className="fill-red-600 transition-all duration-300 hover:fill-red-700"
                />
                <text x={groupWidth / 2 - barWidth / 6} y={chartHeight - enrHeight - 6} textAnchor="middle" className="text-[9px] fill-foreground font-bold">
                  {item.enrollments > 0 ? item.enrollments : ""}
                </text>

                {/* Barra de Cursos Criados */}
                <rect
                  x={groupWidth / 2 + 6}
                  y={chartHeight - courseHeight}
                  width={barWidth}
                  height={courseHeight}
                  rx="6"
                  className="fill-blue-600 transition-all duration-300 hover:fill-blue-700"
                />
                <text x={groupWidth / 2 + barWidth + 6} y={chartHeight - courseHeight - 6} textAnchor="middle" className="text-[9px] fill-foreground font-bold">
                  {(item.coursesCreated || 0) > 0 ? item.coursesCreated : ""}
                </text>

                <text x={groupWidth / 2} y={chartHeight + 24} textAnchor="middle" className="text-[11px] fill-muted-foreground font-black uppercase tracking-wider">
                  {item.month}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center text-xs font-bold text-muted-foreground sm:gap-x-8">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-red-600 inline-block shadow-xs" /> Matrículas Realizadas
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-blue-600 inline-block shadow-xs" /> Cursos Criados
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { previewRole, visibleRole } = useRolePreview();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    const email = user?.email?.toLowerCase();
    const role = user?.role;
    const isAuthorized = canAccessAdminPortal({ email, role });

    if (!user || !isAuthorized) {
      window.location.href = "/login?callbackUrl=/admin";
      return;
    }

    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Não foi possível carregar as estatísticas administrativas.");
        setStats(json);
      } catch (err) {
        console.error("Error loading admin stats:", err);
        setError(err instanceof Error ? err.message : "Não foi possível carregar as estatísticas administrativas.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user, authLoading]);

  if (authLoading || (loading && !stats)) {
    return (
      <div className="site-shell flex items-center justify-center px-4 py-24">
        <Loader className="animate-spin text-red-600" size={36} />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="site-shell page-container py-12">
        <div role="alert" className="surface-card border border-red-200 bg-red-50 p-6 text-red-900 rounded-2xl">
          <h1 className="text-lg font-black">Não foi possível carregar os dados administrativos</h1>
          <p className="mt-2 text-sm">{error}</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700">Tentar novamente</button>
        </div>
      </div>
    );
  }

  const effectiveRole = getEffectiveRole({ email: user?.email, role: user?.role });
  const superadmin = visibleRole === "superadmin";
  const quickActions = [
    { href: "/admin/usuarios", label: "Pessoas e acessos", mobile: true, tone: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300" },
    { href: "/admin/relatorios-academicos", label: "Relatórios acadêmicos", mobile: true, tone: "border-slate-200 bg-card text-foreground dark:border-border" },
    { href: "/admin/certificados", label: "Certificados", mobile: true, tone: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300" },
    ...(superadmin ? [
      { href: "/admin/cms", label: "CMS e marca", mobile: false, tone: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-300" },
      { href: "/admin/cupons", label: "Stripe e cupons", mobile: false, tone: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-300" },
      { href: "/admin/auditoria", label: "Auditoria", mobile: false, tone: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-300" },
    ] : []),
    { href: "/admin/cursos", label: "Gerenciar cursos", mobile: true, wideMobile: true, tone: "border-transparent bg-primary text-primary-foreground shadow-sm shadow-red-600/20" },
  ];

  if (previewRole === "professor") {
    return (
      <div className="site-shell px-4 py-8 sm:px-6 lg:px-8">
        <div className="page-container max-w-4xl space-y-6">
          <section className="surface-card overflow-hidden rounded-3xl border border-sky-200 p-6 shadow-sm dark:border-sky-900/60 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">Visualização segura · professor</p>
            <h1 className="mt-2 text-3xl font-black text-foreground">A área docente em foco</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Nesta simulação, apenas os atalhos e a hierarquia visível de um professor são exibidos. Nenhuma permissão real foi alterada e ações administrativas continuam bloqueadas no servidor.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["/professor", "Visão geral docente"],
                ["/professor/turmas-externas", "Turmas e alunos"],
                ["/professor/tarefas", "Tarefas e correções"],
                ["/professor/progresso-aulas", "Progresso e speaking"],
              ].map(([href, label]) => <Link key={href} href={href} className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm font-black text-sky-900 transition hover:bg-sky-100 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-100 dark:hover:bg-sky-950/50">{label}</Link>)}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="site-shell admin-dashboard-page py-4 sm:py-8">
      <div className="page-container min-w-0 space-y-6 sm:space-y-8">
        {/* Header Harmonizado com o Painel do Professor */}
        <section className="dashboard-hero admin-dashboard-hero grid min-w-0 gap-5 rounded-2xl p-4 sm:gap-6 sm:rounded-3xl sm:p-8 xl:grid-cols-[minmax(0,1fr)_minmax(23rem,0.86fr)] xl:items-center">
          <div className="min-w-0 space-y-2">
            <div className="inline-flex max-w-full items-center gap-2 whitespace-normal break-words rounded-xl bg-red-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-red-600 dark:bg-red-950/40 dark:text-red-400 sm:text-xs sm:tracking-[0.2em]">
              <ShieldCheck size={16} />
              {superadmin ? "Superadministração Global" : "Governança Administrativa"}
            </div>
            <h1 className="max-w-full break-words text-[clamp(1.85rem,8.4vw,2.5rem)] font-black leading-[1.05] tracking-tight text-foreground [overflow-wrap:anywhere] sm:text-4xl">Painel do {roleLabel(visibleRole)}</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {superadmin ? "Controle global de identidade, CMS, integração financeira e todas as operações acadêmicas." : "Gestão ampla de pessoas, cursos, turmas, avaliações, certificados, moderação e auditoria."}
            </p>
          </div>
          <div className="relative z-[1] min-w-0 rounded-2xl border border-white/70 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/20">
            <p className="px-1 pb-2 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Ações frequentes</p>
            <div className="admin-action-grid grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-2">
              {quickActions.map((action) => <Link key={action.href} href={action.href} className={`${action.mobile ? "flex" : "hidden sm:flex"} ${action.wideMobile ? "col-span-2 sm:col-span-1" : ""} min-h-12 min-w-0 items-center rounded-xl border px-3 py-3 text-xs font-bold leading-tight transition hover:-translate-y-0.5 hover:shadow-sm ${action.tone}`}><span className="truncate">{action.label}</span></Link>)}
              <Link href="/professor/turmas-externas?tab=students" className="flex min-h-12 min-w-0 items-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs font-bold leading-tight text-emerald-800 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"><span className="truncate">Turmas e avaliações</span></Link>
            </div>
          </div>
        </section>

        <AdminActionCenter />
        {superadmin && <SuperadminControlCenter />}
        <AdminCapabilityMap isSuperadmin={superadmin} />
        <AdminModerationHub />

        {/* Cards de KPIs em estilo alinhado com a área do aluno */}
        <StudentStyleDashboardStats
          coursesCount={stats?.totalCourses || 0}
          studentsCount={stats?.totalUsers || 0}
          materialsCount={stats?.totalMaterials || 0}
          enrollmentsCount={stats?.totalEnrollments || 0}
          isLoading={loading}
          contextLabel="Governança da plataforma"
          contextDescription="Monitore o crescimento acadêmico e acesse rapidamente as operações que exigem atenção."
        />

        {/* Monitor de Vendas / Stripe & Matrículas */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="order-2 space-y-4 rounded-3xl p-4 surface-card sm:p-8 lg:order-1 lg:col-span-2">
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
              <BarChart3 className="text-red-600" size={22} />
              Evolução de Matrículas e Cursos Criados
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Acompanhamento mensal da conversão de alunos e produção acadêmica no ecossistema.
            </p>
            <MonthlyActivityChart data={stats?.monthlyActivity || []} />
          </div>

          <div className="order-1 space-y-4 rounded-3xl p-4 surface-card sm:p-8 lg:order-2">
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
              <Users className="text-red-600" size={22} />
              Busca Administrativa Rápida
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Encontre alunos, professores e registros por nome, CPF ou e-mail instantaneamente.
            </p>
            <AdminSearchWidget />
          </div>
        </div>

        {superadmin && <div className="surface-card p-6 sm:p-8 rounded-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-black text-foreground flex items-center gap-2"><Award className="text-violet-600" size={22} /> Monitor de Comércio e Faturamento</h2>
            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-violet-700 dark:bg-violet-950/40 dark:text-violet-200">Exclusivo</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Acompanhe o status do Stripe, faturamento consolidado, cupons ativos e transações recentes.</p>
          <AdminCommerceMonitor data={stats?.commerce || {
            commerceAvailable: false,
            salesSummary: { totalPurchases: 0, totalRevenue: 0, currency: "BRL", revenueBasis: "unavailable", uniqueBuyers: 0, totalEnrollments: 0 },
            topSellingCourses: [], recentPurchases: [], recentEnrollments: []
          }} />
        </div>}
      </div>
    </div>
  );
}
