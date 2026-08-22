import { ArrowLeft, FileSignature, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CertificateSignatureManager } from "@/components/certificate-signature-manager";
import { CertificateTemplateManager } from "@/components/certificate-template-manager";
import { CertificateLaboratoryManager } from "@/components/certificate-laboratory-manager";

export const metadata = {
  title: "Assinatura e Laboratório de Certificados | Administração",
  description: "Envie certificados finais assinados e teste as 4 possibilidades de editores visuais.",
};

export default async function AdminCertificatesPage() {
  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    (session.user.role !== "admin" && session.user.role !== "super_admin" && session.user.role !== "professor")
  ) {
    redirect("/login?callbackUrl=/admin/certificados");
  }

  return (
    <div className="site-shell px-4 py-8 sm:px-6 lg:px-8">
      <div className="page-container space-y-10">
        <header className="surface-card flex flex-col gap-5 border border-border/70 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-red-700 dark:bg-red-950/40 dark:text-red-300">
              <ShieldCheck size={16} /> Governança de Certificados
            </div>
            <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              <FileSignature className="text-red-600" /> Assinaturas & Laboratório 4-em-1
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Gerencie assinaturas (manuais ou via gov.br), crie templates institucionais e teste as 4 arquiteturas de edição visual (Gerador Padrão, Fabric.js, Konva.js e GrapesJS/HTML).
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-bold text-foreground transition hover:border-red-300 hover:bg-muted"
          >
            <ArrowLeft size={16} /> Voltar ao painel
          </Link>
        </header>

        {/* Seção de Laboratório das 4 Possibilidades */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="text-red-600" size={20} />
            <h2 className="text-xl font-black text-foreground">Laboratório Comparativo de Editores (4 Possibilidades)</h2>
          </div>
          <CertificateLaboratoryManager />
        </section>

        <CertificateTemplateManager />
        <CertificateSignatureManager />
      </div>
    </div>
  );
}
