import { getServerSession } from "next-auth/next";
export const dynamic = "force-dynamic";

import { authOptions } from "@/lib/auth";
import { getUserActivityProgress } from "@/lib/db";
import { Calendar } from "lucide-react";

export default async function CalendarioPage() {
  const session = await getServerSession(authOptions);
  const userId = parseInt(session?.user?.id ?? "");
  const atividades =
    !isNaN(userId) && userId > 0 ? await getUserActivityProgress(userId) : [];

  const eventos = atividades
    .filter((a) => a.activity?.dueDate && a.status !== "completed")
    .sort(
      (a, b) =>
        new Date(a.activity!.dueDate!).getTime() - new Date(b.activity!.dueDate!).getTime()
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendário</h1>
        <p className="text-gray-600">
          Prazos de atividades que ainda faltam concluir
        </p>
      </div>

      {eventos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">
            Nenhum prazo pendente no momento.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {eventos.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="text-red-600" size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {item.activity?.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(item.activity!.dueDate!).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 flex-shrink-0">
                {item.status === "in_progress" ? "Em Progresso" : "Pendente"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
