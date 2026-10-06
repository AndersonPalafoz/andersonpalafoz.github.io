import { getServerSession } from "next-auth/next";
export const dynamic = "force-dynamic";

import { authOptions } from "@/lib/auth";
import { getUserActivityProgress } from "@/lib/db";
import { CheckSquare } from "lucide-react";
import { StudentActivitiesBoard } from "@/components/student-activities-board";

export default async function AtividadesPage() {
  const session = await getServerSession(authOptions);
  const userId = parseInt(session?.user?.id ?? "");
  const atividades =
    !isNaN(userId) && userId > 0 ? await getUserActivityProgress(userId) : [];

  const items = atividades.map((item) => ({
    id: item.id,
    title: item.activity?.title ?? "Atividade",
    description: item.activity?.description ?? null,
    dueDate: item.activity?.dueDate ? new Date(item.activity.dueDate).toISOString() : null,
    courseId: item.activity?.courseId ?? null,
    status: item.status === "completed" || item.status === "in_progress" ? item.status : "pending" as const,
    score: item.score ?? null,
    teacherFeedback: item.teacherFeedback ?? null,
    submittedAt: item.submittedAt ? new Date(item.submittedAt).toISOString() : null,
    completedAt: item.completedAt ? new Date(item.completedAt).toISOString() : null,
  }));

  return (
    <main className="space-y-8 bg-slate-50 pb-10 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="dashboard-hero rounded-3xl border border-slate-200 p-5 dark:border-slate-800 sm:p-7"><span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-red-300">Organização de estudos</span><h1 className="mt-3 flex items-center gap-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl"><CheckSquare className="text-red-600" size={31} aria-hidden="true" /> Atividades</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Visualize prazos, entregas e os comentários recebidos para saber exatamente o que fazer em seguida.</p></header>
      <StudentActivitiesBoard activities={items} />
    </main>
  );
}
