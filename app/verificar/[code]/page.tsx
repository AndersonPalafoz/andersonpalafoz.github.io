import { db } from "@/lib/db";
import { certificates, courses, users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { Award, CheckCircle2, Download, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "type-fest";

interface Props {
  params: { code: string };
}

export async function generateMetadata({ params }: Props): Promise<any> {
  const code = params.code;
  const cert = await db.select({
    studentName: users.name,
    courseTitle: courses.title,
    level: certificates.level,
  })
    .from(certificates)
    .leftJoin(users, eq(certificates.userId, users.id))
    .leftJoin(courses, eq(certificates.courseId, courses.id))
    .where(eq(certificates.certificateCode, code))
    .limit(1);

  const title = cert.length > 0 ? `Certificado de Conclusão — ${cert[0].studentName} (${cert[0].courseTitle})` : "Verificação de Certificado | Anderson Palafoz";
  const description = "Certificado oficial emitido pela plataforma acadêmica de Anderson Palafoz. Documento autenticado.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://andersonpalafoz.vercel.app/verificar/${code}`,
      images: [
        {
          url: "https://andersonpalafoz.vercel.app/og-certificate.png",
          width: 1200,
          height: 630,
          alt: "Certificado Oficial Anderson Palafoz",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublicVerifyCertificatePage({ params }: Props) {
  const code = params.code;
  const cert = await db.select({
    id: certificates.id,
    level: certificates.level,
    issuedAt: certificates.issuedAt,
    certificateCode: certificates.certificateCode,
    signatureType: certificates.signatureType,
    signedPdfUrl: certificates.signedPdfUrl,
    certificateUrl: certificates.certificateUrl,
    studentName: users.name,
    courseTitle: courses.title,
  })
    .from(certificates)
    .leftJoin(users, eq(certificates.userId, users.id))
    .leftJoin(courses, eq(certificates.courseId, courses.id))
    .where(eq(certificates.certificateCode, code))
    .limit(1);

  if (cert.length === 0) {
    return (
      <div className="site-shell min-h-screen bg-background flex items-center justify-center p-6 text-foreground">
        <div className="surface-card max-w-md w-full text-center p-8 border border-border/70 space-y-4">
          <div className="h-14 w-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-xl font-black">Certificado Não Encontrado</h1>
          <p className="text-sm text-muted-foreground">O código de autenticidade informado ({code}) não corresponde a nenhum certificado válido emitido na plataforma.</p>
          <Link href="/" className="inline-block rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700">
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  const item = cert[0];
  const downloadUrl = item.signedPdfUrl || item.certificateUrl || "#";

  return (
    <div className="site-shell min-h-screen bg-background pb-16 text-foreground">
      <header className="border-b border-border bg-card">
        <div className="page-container py-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-red-600">
            <ArrowLeft size={16} /> Anderson Palafoz Platform
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 size={14} /> Documento Oficial Autêntico
          </span>
        </div>
      </header>

      <main className="page-container mt-10 max-w-2xl">
        <div className="surface-card border border-border/70 p-8 sm:p-10 shadow-lg space-y-6">
          <div className="text-center space-y-2 border-b border-border/60 pb-6">
            <div className="h-16 w-16 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center mx-auto">
              <Award size={32} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Validação de Autenticidade</p>
            <h1 className="text-2xl font-black text-foreground sm:text-3xl">{item.courseTitle}</h1>
            <p className="text-sm text-muted-foreground">Nível {item.level} • Concluído em {new Date(item.issuedAt).toLocaleDateString("pt-BR")}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-sm bg-muted/30 p-5 rounded-2xl border border-border/50">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Titular do Certificado</p>
              <p className="mt-1 font-black text-foreground text-base">{item.studentName || "Aluno(a)"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Código de Autenticidade</p>
              <p className="mt-1 font-mono font-bold text-foreground text-xs bg-background p-2 rounded-lg border border-border">{item.certificateCode}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
            <p className="text-xs text-muted-foreground">Emitido digitalmente com assinatura oficial da plataforma.</p>
            {downloadUrl !== "#" && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-red-700 shadow-sm"
              >
                <Download size={15} /> Baixar PDF Oficial
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
