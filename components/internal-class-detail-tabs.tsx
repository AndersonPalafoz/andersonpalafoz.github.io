import Link from "next/link";
import { BarChart3, CalendarCheck2, ClipboardList, LayoutDashboard, Users, Video } from "lucide-react";

type DetailTab = "overview" | "students" | "sessions" | "attendance" | "activities" | "progress";

type StudentSummary = {
  id: number;
  name: string;
  socialName: string | null;
  email: string | null;
  status: string;
  enrolledAt: Date;
};

type ActivitySummary = {
  id: number;
  title: string;
  type: string;
  dueDate: Date | null;
};

const tabs: Array<{ id: DetailTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard },
  { id: "students", label: "Alunos", icon: Users },
  { id: "sessions", label: "Sessões", icon: Video },
  { id: "attendance", label: "Presença", icon: CalendarCheck2 },
  { id: "activities", label: "Atividades", icon: ClipboardList },
  { id: "progress", label: "Progresso", icon: BarChart3 },
];

function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center"><p className="font-bold text-foreground">{title}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div>;
}

export function InternalClassDetailTabs({
  offerId,
  activeTab,
  students,
  activities,
  attendanceDates,
  courseTitle,
}: {
  offerId: number;
  activeTab: DetailTab;
  students: StudentSummary[];
  activities: ActivitySummary[];
  attendanceDates: string[];
  courseTitle: string;
}) {
  const linkFor = (tab: DetailTab) => `/professor/turmas-internas/${offerId}?tab=${tab}`;

  return (
    <section className="space-y-5">
      <nav aria-label="Seções da turma interna" className="overflow-x-auto rounded-2xl border border-border bg-card p-2 shadow-sm">
        <div className="flex min-w-max gap-1" role="tablist">
          {tabs.map(({ id, label, icon: Icon }) => (
            <Link key={id} href={linkFor(id)} role="tab" aria-selected={activeTab === id} className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${activeTab === id ? "bg-red-600 text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <Icon size={16} aria-hidden="true" />{label}
            </Link>
          ))}
        </div>
      </nav>

      {activeTab === "overview" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Alunos internos</p><p className="mt-2 text-3xl font-black text-foreground">{students.length}</p><p className="mt-1 text-sm text-muted-foreground">Matrículas ligadas ao site.</p></div>
          <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Atividades</p><p className="mt-2 text-3xl font-black text-foreground">{activities.length}</p><p className="mt-1 text-sm text-muted-foreground">Itens disponíveis para o curso.</p></div>
          <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Registros de presença</p><p className="mt-2 text-3xl font-black text-foreground">{attendanceDates.length}</p><p className="mt-1 text-sm text-muted-foreground">Datas persistidas para esta turma.</p></div>
        </div>
      )}

      {activeTab === "students" && (
        students.length === 0 ? <EmptyState title="Nenhum aluno interno vinculado" description="As matrículas desta turma aparecerão aqui quando forem atribuídas a contas da plataforma." /> : <div className="space-y-3">{students.map((student) => <article key={student.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-foreground">{student.socialName || student.name}</h2><p className="text-sm text-muted-foreground">{student.email || "Sem e-mail informado"}</p></div><div className="flex flex-wrap items-center gap-2 text-xs font-bold"><span className="rounded-full bg-muted px-2.5 py-1 text-foreground">{student.status === "active" ? "Ativo" : student.status}</span><span className="text-muted-foreground">Desde {student.enrolledAt.toLocaleDateString("pt-BR")}</span></div></div></article>)}</div>
      )}

      {activeTab === "sessions" && <EmptyState title="Sessões ainda não registradas" description="A estrutura está pronta para receber encontros, links e horários persistidos sem misturar esta turma com registros externos." />}

      {activeTab === "attendance" && (attendanceDates.length === 0 ? <EmptyState title="Nenhuma chamada registrada" description="Quando uma chamada for lançada para esta turma, as datas e os indicadores de presença aparecerão aqui." /> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{attendanceDates.map((date) => <div key={date} className="rounded-2xl border border-border bg-card p-4"><p className="text-xs font-black uppercase tracking-wider text-red-600">Chamada registrada</p><p className="mt-2 font-bold text-foreground">{date}</p></div>)}</div>)}

      {activeTab === "activities" && (activities.length === 0 ? <EmptyState title="Nenhuma atividade vinculada" description={`As atividades do curso ${courseTitle} aparecerão aqui quando forem criadas para esta oferta interna.`} /> : <div className="grid gap-3 md:grid-cols-2">{activities.map((activity) => <div key={activity.id} className="rounded-2xl border border-border bg-card p-4"><p className="text-xs font-black uppercase tracking-wider text-red-600">{activity.type}</p><h2 className="mt-1 font-bold text-foreground">{activity.title}</h2><p className="mt-2 text-sm text-muted-foreground">{activity.dueDate ? `Prazo: ${activity.dueDate.toLocaleDateString("pt-BR")}` : "Sem prazo definido"}</p></div>)}</div>)}

      {activeTab === "progress" && <EmptyState title="Progresso por aluno disponível na área do aluno" description="Esta visão docente será detalhada com indicadores por estudante a partir das mesmas evidências persistidas de aulas e atividades, sem criar percentuais independentes." />}
    </section>
  );
}

export type { DetailTab, StudentSummary, ActivitySummary };
