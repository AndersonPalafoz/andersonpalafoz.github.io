import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getMaterialById } from "@/lib/db";
import { DownloadMaterialButton } from "@/components/download-material-button";
import { Download } from "lucide-react";

async function MaterialDetail({ materialId }: { materialId: number }) {
  const material = await getMaterialById(materialId);

  if (!material) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Material não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Materiais", href: "/materiais" },
            { label: material.title, href: `/materiais/${material.id}` },
          ]}
        />

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
              {material.category}
            </span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
              {material.level}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900">{material.title}</h1>

          {material.description && (
            <p className="text-lg text-gray-600 leading-relaxed">{material.description}</p>
          )}

          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Download size={16} className="text-red-600" />
            <span>{material.downloads} downloads</span>
          </div>

          <div className="pt-4">
            {material.fileUrl ? (
              <DownloadMaterialButton materialId={material.id} fileUrl={material.fileUrl} />
            ) : (
              <p className="text-gray-500">
                Arquivo ainda não disponível para este material.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-600">Carregando material...</p>
        </div>
      }
    >
      <MaterialDetail materialId={parseInt(id)} />
    </Suspense>
  );
}
