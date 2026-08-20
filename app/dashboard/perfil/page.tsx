import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserByEmail } from "@/lib/db";
import { User, Mail, ShieldCheck } from "lucide-react";
import { ProfileForm } from "@/components/profile-form";
import { ProfileBillingSection } from "@/components/profile-billing-section";
import { ProfileNotesSection } from "@/components/profile-notes-section";
import { ProfileInactivitySettings } from "@/components/profile-inactivity-settings";
import { ProfileMedalsGallery } from "@/components/profile-medals-gallery";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  professor: "Professor",
  user: "Aluno",
};

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  const dbUser = session?.user?.email ? await getUserByEmail(session.user.email) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais e visualize suas conquistas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar e Info Principal */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 rounded-xl border border-gray-200 bg-white space-y-4 text-center">
            {dbUser?.avatarUrl ?? session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={(dbUser?.avatarUrl ?? session?.user?.image) as string}
                alt={session?.user?.name ?? "Foto de perfil"}
                className="w-24 h-24 rounded-full mx-auto object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <User className="text-red-600" size={40} />
              </div>
            )}
            <div>
              <h2 className="font-bold text-gray-900 text-lg">
                {dbUser?.name ?? session?.user?.name ?? "Aluno"}
              </h2>
              <p className="text-sm text-gray-500">
                {ROLE_LABEL[session?.user?.role ?? "user"] ?? "Aluno"}
              </p>
            </div>
            {dbUser?.location && (
              <p className="text-sm text-gray-500">{dbUser.location}</p>
            )}
          </div>

          <div className="p-6 rounded-xl border border-gray-200 bg-white space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Conta</h3>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-red-600 flex-shrink-0" />
              <p className="text-sm text-gray-700 truncate">{session?.user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-red-600 flex-shrink-0" />
              <p className="text-sm text-gray-700">Conectado via Google</p>
            </div>
          </div>

          <ProfileInactivitySettings />
        </div>

        {/* Formulário de Edição e Faturamento */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-xl border border-gray-200 bg-white">
            <h3 className="font-bold text-gray-900 mb-6">Editar Informações</h3>
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
          <ProfileNotesSection />
          <ProfileBillingSection />
        </div>
      </div>
    </div>
  );
}
