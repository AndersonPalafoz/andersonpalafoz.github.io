import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudentCertificatesGallery } from "@/components/student-certificates-gallery";
import { CertificateShareButton } from "@/components/certificate-share-button";
import Link from "next/link";
import { ArrowLeft, Award, Bell } from "lucide-react";

export const metadata = {
  title: "Meus Certificados | Área do Aluno",
  description: "Visualize, baixe e compartilhe seus certificados de conclusão conquistados.",
};

export default async function DashboardCertificatesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/certificados");
  }

  return (
    <div className="site-shell min-h-screen bg-slate-50 pb-16 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="page-container py-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-red-600">
            <ArrowLeft size={16} /> Voltar ao Dashboard
          </Link>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-red-700 dark:border-slate-700 dark:bg-slate-900 dark:text-red-300">
                <Award size={15} aria-hidden="true" /> Conquistas Acadêmicas
              </span>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">Galeria de Certificados</h1>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">Seus certificados assinados ficam disponíveis aqui assim que você conclui 100% das aulas.</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-800 dark:text-emerald-200">
              <Bell size={16} aria-hidden="true" className="shrink-0 text-emerald-600" />
              <span>Notificações ativadas para novos certificados assinados.</span>
            </div>
          </div>
        </div>
      </header>

      <main className="page-container mt-8 space-y-6">
        <div className="hidden">
          <CertificateShareButton certificateUrl="/sample.pdf" courseTitle="Exemplo" />
        </div>
        <StudentCertificatesGallery />
      </main>
    </div>
  );
}
