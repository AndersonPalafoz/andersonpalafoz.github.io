export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckSquare, Calendar, MessageCircle } from "lucide-react";
import { db } from "@/lib/db";
import { activities, users } from "@/drizzle/schema";
import { desc, eq, and, isNull } from "drizzle-orm";
import { buildWhatsAppMessageLink, buildDeadlineReminderText } from "@/lib/notifications-helper";

export const metadata = {
  title: "Gerenciamento de Tarefas e Deadlines | Painel do Professor",
  description: "Gerencie prazos de atividades, envie lembretes via WhatsApp e acompanhe entregas.",
};

export default async function TeacherTasksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) {
    redirect("/");
  }

  const [allActivities, _, activeStudents] = await Promise.all([
    db.query.activities.findMany({
      with: { course: true },
      orderBy: desc(activities.createdAt),
    }),
    db.query.courses.findMany(),
    db.query.users.findMany({
      where: and(eq(users.role, "user"), isNull(users.deletedAt)),
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <Link href="/professor" className="text-sm font-semibold text-red-600 hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft size={16} /> Voltar ao Painel do Professor
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CheckSquare className="text-red-600" size={32} />
              Gerenciamento de Tarefas e Deadlines
            </h1>
            <p className="text-gray-600 mt-1">
              Monitore prazos de entrega, envie lembretes automáticos e acompanhe as atividades dos alunos.
            </p>
          </div>
        </div>

        {/* Lista de Atividades e Prazos */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Atividades Cadastradas e Prazos</h2>

          {allActivities.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">Nenhuma atividade cadastrada no momento.</p>
          ) : (
            <div className="space-y-4">
              {allActivities.map((act) => {
                const dueDateFormatted = act.dueDate
                  ? new Date(act.dueDate).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Sem prazo definido";

                const sampleStudent = activeStudents[0];
                const waLink = sampleStudent?.phone
                  ? buildWhatsAppMessageLink(
                      sampleStudent.phone,
                      buildDeadlineReminderText(act.title, act.dueDate || new Date(), act.course?.title || "Curso")
                    )
                  : "#";

                return (
                  <div key={act.id} className="p-6 rounded-xl bg-gray-50 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-red-100 text-red-600">
                          {act.type}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">Curso: {act.course?.title || "Geral"}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">{act.title}</h3>
                      <p className="text-sm text-gray-600">{act.description || "Sem descrição informada."}</p>
                      <p className="text-xs text-red-600 font-semibold flex items-center gap-1 pt-1">
                        <Calendar size={14} /> Prazo: {dueDateFormatted}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {sampleStudent?.phone && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-xs transition inline-flex items-center gap-1.5"
                        >
                          <MessageCircle size={14} /> Enviar lembrete WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
