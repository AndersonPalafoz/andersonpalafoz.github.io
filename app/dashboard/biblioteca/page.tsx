export const dynamic = "force-dynamic";

import { getMaterials, getUserByEmail, db } from "@/lib/db";
import { materialProgress } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CheckCircle2, FileText } from "lucide-react";
import { DownloadMaterialButton } from "@/components/download-material-button";

export default async function BibliotecaPage() {
  const materiais = await getMaterials();
  const session = await getServerSession(authOptions);
  const user = session?.user?.email ? await getUserByEmail(session.user.email) : null;
  const completedRows = user ? await db.select({ materialId: materialProgress.materialId }).from(materialProgress).where(eq(materialProgress.userId, user.id)) : [];
  const completedMaterialIds = new Set(completedRows.map((row) => row.materialId));

  return (
    <main className="space-y-6 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-red-300">Recursos de estudo</span>
        <h1 className="mt-3 mb-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Biblioteca
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Acesse todos os materiais de estudo disponíveis
        </p>
      </header>

      {materiais.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <FileText className="mx-auto text-gray-400 dark:text-slate-500 mb-4" size={48} />
          <p className="text-gray-600 dark:text-slate-400">Nenhum material disponível no momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {materiais.map((material) => (
            <div
              key={material.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                  <FileText className="text-red-600" size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold truncate font-black text-slate-900 dark:text-white">
                    {material.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {material.category} • Nível {material.level} • {material.downloads} downloads
                  </p>
                  {completedMaterialIds.has(material.id) && <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-700"><CheckCircle2 size={14} /> Material concluído</span>}
                </div>
              </div>

              {material.fileUrl ? (
                <DownloadMaterialButton materialId={material.id} fileUrl={material.fileUrl} />
              ) : (
                <span className="text-sm text-gray-400 dark:text-slate-500 flex-shrink-0">Em breve</span>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
