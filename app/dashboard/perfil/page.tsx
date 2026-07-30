import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { User, Mail, ShieldCheck } from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  professor: "Professor",
  user: "Aluno",
};

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
        <p className="text-gray-600">Suas informações de conta</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar e Info Principal */}
        <div className="md:col-span-1">
          <div className="p-6 rounded-xl border border-gray-200 bg-white space-y-4 text-center">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name ?? "Foto de perfil"}
                className="w-24 h-24 rounded-full mx-auto object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <User className="text-red-600" size={40} />
              </div>
            )}
            <div>
              <h2 className="font-bold text-gray-900 text-lg">{user?.name ?? "Aluno"}</h2>
              <p className="text-sm text-gray-500">
                {ROLE_LABEL[user?.role ?? "user"] ?? "Aluno"}
              </p>
            </div>
          </div>
        </div>

        {/* Informações da conta */}
        <div className="md:col-span-2">
          <div className="p-6 rounded-xl border border-gray-200 bg-white space-y-5">
            <h3 className="font-bold text-gray-900">Informações da Conta</h3>

            <div className="flex items-center gap-3 py-3 border-b border-gray-100">
              <Mail size={18} className="text-red-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">E-mail</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-3">
              <ShieldCheck size={18} className="text-red-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Tipo de conta</p>
                <p className="font-medium text-gray-900">
                  {ROLE_LABEL[user?.role ?? "user"] ?? "Aluno"}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500 pt-2">
              Sua conta é gerenciada pelo login do Google. Edição de nome, foto
              e outras informações pessoais estará disponível em breve.
            </p>
          </div>
        </div>
      </div>

      {/* Seção de Segurança */}
      <div className="p-6 rounded-xl border border-gray-200 bg-white space-y-4">
        <h3 className="font-bold text-gray-900">Segurança</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Autenticação</p>
            <p className="text-sm text-gray-500">Conectado via Google</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Conectado
          </span>
        </div>
      </div>
    </div>
  );
}
