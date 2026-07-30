import { getMaterials } from "@/lib/db";
import { FileText } from "lucide-react";
import { DownloadMaterialButton } from "@/components/download-material-button";

export default async function BibliotecaPage() {
  const materiais = await getMaterials();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Biblioteca
        </h1>
        <p className="text-gray-600">
          Acesse todos os materiais de estudo disponíveis
        </p>
      </div>

      {materiais.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">Nenhum material disponível no momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {materiais.map((material) => (
            <div
              key={material.id}
              className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="text-red-600" size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {material.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {material.category} • Nível {material.level} • {material.downloads} downloads
                  </p>
                </div>
              </div>

              {material.fileUrl ? (
                <DownloadMaterialButton materialId={material.id} fileUrl={material.fileUrl} />
              ) : (
                <span className="text-sm text-gray-400 flex-shrink-0">Em breve</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
