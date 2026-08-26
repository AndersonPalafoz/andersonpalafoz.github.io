import Link from "next/link";
import { ArrowLeft, FileSignature, ShieldCheck, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { AdminCertificateWorkflow } from "@/components/admin-certificate-workflow";
import { CertificateWorkspaceProvider } from "@/components/certificate-workspace-context";

export const metadata = {
  title: "Certificados | Administração",
  description: "Emita, revise, assine e gerencie modelos de certificados em um fluxo operacional seguro.",
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
    <div className="site-shell min-h-screen px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <CertificateWorkspaceProvider>
      <div className="container space-y-10 py-0">
        <header className="surface-card flex flex-col gap-5 overflow-hidden border border-border/70 bg-[radial-gradient(circle_at_top_right,rgba(214,40,40,0.12),transparent_34%),linear-gradient(135deg,hsl(var(--card)),hsl(var(--muted)/0.42))] p-5 shadow-[0_18px_60px_rgba(15,23,42,0.07)] sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-red-700 dark:bg-red-950/40 dark:text-red-300">
              <ShieldCheck size={16} /> Governança de Certificados
            </div>
            <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              <FileSignature className="text-red-600" /> Certificados
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Emita certificados pelo gerador oficial, revise pendências, gerencie modelos parametrizados e encaminhe documentos para assinatura. O laboratório com Fabric, Konva e GrapesJS permanece separado para experimentação e não participa da emissão oficial.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-muted sm:w-fit"
          >
            <ArrowLeft size={16} /> Voltar ao painel
          </Link>
        </header>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-red-600" size={20} />
              <h2 className="text-xl font-black text-foreground">Fluxo de produção do certificado</h2>
            </div>
            <span className="w-fit rounded-full border border-border/70 bg-card px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">3 etapas oficiais · laboratório experimental separado</span>
          </div>
          <AdminCertificateWorkflow />
        </section>
      </div>
      </CertificateWorkspaceProvider>
    </div>
  );
}
