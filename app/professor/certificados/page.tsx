import Link from "next/link";
import { ArrowLeft, FileSignature, GraduationCap } from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CertificateSignatureManager } from "@/components/certificate-signature-manager";
import { CertificateWorkspaceProvider } from "@/components/certificate-workspace-context";

export const metadata = {
  title: "Certificados e Assinaturas | Professor",
  description: "Emita, revise e envie certificados finais dos cursos sob sua gestão.",
};

export default async function ProfessorCertificatesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["professor", "admin", "super_admin"].includes(session.user.role || "")) {
    redirect("/login?callbackUrl=/professor/certificados");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="page-container space-y-8">
        <header className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-red-700 dark:border-slate-700 dark:bg-slate-900 dark:text-red-300"><GraduationCap size={16} aria-hidden="true" /> Área acadêmica</div>
            <h1 className="flex min-w-0 items-center gap-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl"><FileSignature aria-hidden="true" className="shrink-0 text-red-600" /> <span className="break-words">Certificados e assinaturas</span></h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">Emita certificados, revise uma prévia do documento e envie a versão final assinada. A fila exibe somente cursos que você pode gerenciar.</p>
          </div>
          <Link href="/professor" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white transition hover:border-red-300 hover:bg-muted"><ArrowLeft size={16} aria-hidden="true" /> Voltar ao painel</Link>
        </header>
        <CertificateWorkspaceProvider>
          <CertificateSignatureManager />
        </CertificateWorkspaceProvider>
      </div>
    </main>
  );
}
