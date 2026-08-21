import Link from "next/link";
import { ArrowLeft, FileSignature, GraduationCap } from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CertificateSignatureManager } from "@/components/certificate-signature-manager";

export const metadata = {
  title: "Assinatura de Certificados | Professor",
  description: "Envie certificados finais assinados manualmente ou via gov.br.",
};

export default async function ProfessorCertificatesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["professor", "admin", "super_admin"].includes(session.user.role || "")) {
    redirect("/login?callbackUrl=/professor/certificados");
  }

  return (
    <div className="site-shell px-4 py-8 sm:px-6 lg:px-8">
      <div className="page-container space-y-8">
        <header className="surface-card flex flex-col gap-5 border border-border/70 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-red-700 dark:bg-red-950/40 dark:text-red-300"><GraduationCap size={16} /> Área acadêmica</div>
            <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl"><FileSignature className="text-red-600" /> Assinaturas finais</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">Envie o PDF final de cada certificado depois da assinatura manual ou da assinatura via gov.br. O vínculo é feito somente com cursos que você pode gerenciar.</p>
          </div>
          <Link href="/professor" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-bold text-foreground transition hover:border-red-300 hover:bg-muted"><ArrowLeft size={16} /> Voltar ao painel</Link>
        </header>
        <CertificateSignatureManager />
      </div>
    </div>
  );
}
