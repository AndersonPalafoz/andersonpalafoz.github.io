import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserByEmail } from "@/lib/db";
import Link from "next/link";
import { User, Mail, ShieldCheck, Award } from "lucide-react";
import { ProfileForm } from "@/components/profile-form";
import { ProfileBillingSection } from "@/components/profile-billing-section";
import { ProfileNotesSection } from "@/components/profile-notes-section";
import { ProfileInactivitySettings } from "@/components/profile-inactivity-settings";
import { ProfileMedalsGallery } from "@/components/profile-medals-gallery";
import { ProfileLearningHistoryAndCertificates } from "@/components/profile-learning-history-and-certificates";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  professor: "Professor",
  user: "Aluno",
};

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  const dbUser = session?.user?.email ? await getUserByEmail(session.user.email) : null;

  return (
    <main className="space-y-6 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-red-300">Minha conta</span>
        <h1 className="mt-3 mb-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Meu Perfil</h1>
        <p className="text-slate-600 dark:text-slate-300">Gerencie suas informações pessoais e visualize suas conquistas</p>
      </header>

      <Link href="#medals-title" className="surface-card flex min-h-12 items-center justify-between gap-3 border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-black text-red-700 transition hover:border-red-300 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-red-300 md:hidden">
        <span className="inline-flex min-w-0 items-center gap-2"><Award size={18} aria-hidden="true" className="shrink-0" /> <span>Ver minhas medalhas e emblemas</span></span>
        <span aria-hidden="true">→</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar e Info Principal */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 text-center">
            {dbUser?.avatarUrl ?? session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={(dbUser?.avatarUrl ?? session?.user?.image) as string}
                alt={session?.user?.name ?? "Foto de perfil"}
                className="w-24 h-24 rounded-full mx-auto object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <User className="text-red-600" size={40} aria-hidden="true" />
              </div>
            )}
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">
                {dbUser?.name ?? session?.user?.name ?? "Aluno"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {ROLE_LABEL[session?.user?.role ?? "user"] ?? "Aluno"}
              </p>
            </div>
            {dbUser?.location && (
              <p className="text-sm text-gray-500 dark:text-slate-400">{dbUser.location}</p>
            )}
          </div>

          <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Conta</h3>
            <div className="flex items-center gap-3">
              <Mail size={16} aria-hidden="true" className="text-red-600 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-slate-300 truncate">{session?.user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} aria-hidden="true" className="text-red-600 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-slate-300">Conectado via Google</p>
            </div>
          </div>

          <ProfileInactivitySettings />
        </div>

        {/* Formulário de Edição e Faturamento */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">Editar Informações</h3>
            <ProfileForm
              initialName={dbUser?.name ?? session?.user?.name ?? ""}
              initialSocialName={dbUser?.socialName ?? ""}
              initialCpf={dbUser?.cpf ?? ""}
              initialPhone={dbUser?.phone ?? ""}
              initialLocation={dbUser?.location ?? ""}
              initialBio={dbUser?.bio ?? ""}
              initialAvatarUrl={dbUser?.avatarUrl ?? session?.user?.image ?? ""}
            />
          </div>
          <ProfileMedalsGallery />
          <ProfileLearningHistoryAndCertificates />
          <ProfileNotesSection />
          <ProfileBillingSection />
        </div>
      </div>
    </main>
  );
}
