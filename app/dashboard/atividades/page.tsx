import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserActivityProgress } from "@/lib/db";
import { CheckCircle2, Clock, AlertCircle, CheckSquare } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  completed: "Completa",
  in_progress: "Em Progresso",
  pending: "Pendente",
};

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="text-green-500" size={20} />;
    case "in_progress":
      return <Clock className="text-blue-500" size={20} />;
    default:
      return <AlertCircle className="text-amber-500" size={20} />;
  }
}

export default async function AtividadesPage() {
  const session = await getServerSession(authOptions);
  const userId = parseInt(session?.user?.id ?? "");
  const atividades =
    !isNaN(userId) && userId > 0 ? await getUserActivityProgress(userId) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Atividades</h1>
        <p className="text-gray-600">
          Acompanhe suas atividades e tarefas
        </p>
      </div>

      {atividades.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <CheckSquare className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">
            Nenhuma atividade atribuída no momento.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {atividades.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div>{getStatusIcon(item.status)}</div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {item.activity?.title ?? "Atividade"}
                  </h3>
                  {item.activity?.dueDate && (
                    <p className="text-sm text-gray-500">
                      Prazo:{" "}
                      {new Date(item.activity.dueDate).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-gray-900">
                  {STATUS_LABEL[item.status] ?? item.status}
                </p>
                {item.status === "completed" && item.score != null && (
                  <p className="text-xs text-green-600">{item.score}%</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
