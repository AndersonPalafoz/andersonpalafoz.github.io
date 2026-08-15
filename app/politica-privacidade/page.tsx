import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Política de Privacidade | Anderson Palafoz",
  description: "Política de privacidade e proteção de dados da plataforma Anderson Palafoz.",
  alternates: {
    canonical: "/politica-privacidade",
  },
};

export default function PoliticaPrivacidadePage() {
  return (
    <main className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-10">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition mb-6"
          >
            <ArrowLeft size={16} /> Voltar para a página inicial
          </Link>
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck size={16} /> Transparência e Segurança
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Política de Privacidade</h1>
          <p className="mt-4 text-base text-gray-600">
            Última atualização: 15 de agosto de 2026
          </p>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">1. Introdução</h2>
            <p>
              A plataforma <strong>Anderson Palafoz</strong> preza pela privacidade e proteção dos dados pessoais de seus alunos, visitantes e professores. Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos e protegemos suas informações ao utilizar nosso site e serviços educacionais.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">2. Informações Coletadas</h2>
            <p>
              Coletamos apenas as informações estritamente necessárias para a prestação dos serviços educacionais e gerenciamento acadêmico:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Dados de Identificação:</strong> Nome completo e endereço de e-mail obtidos durante a autenticação (Google OAuth) ou cadastro.</li>
              <li><strong>Dados Acadêmicos:</strong> Matrículas, progresso em cursos, frequência em aulas, atividades e submissões de materiais.</li>
              <li><strong>Comunicações:</strong> Mensagens enviadas através do formulário de contato ou sistema de mensagens diretas.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">3. Uso das Informações</h2>
            <p>
              Os dados coletados são utilizados exclusivamente para:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Permitir o acesso seguro às áreas restritas (Dashboard do Aluno e Painel do Professor).</li>
              <li>Acompanhar o progresso pedagógico e emitir certificados de conclusão.</li>
              <li>Enviar notificações importantes sobre prazos (deadlines), atualizações de cursos e mensagens diretas.</li>
              <li>Garantir a segurança da plataforma e prevenir acessos não autorizados.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">4. Compartilhamento e Proteção de Dados</h2>
            <p>
              Seus dados pessoais nunca são comercializados ou cedidos a terceiros para fins publicitários. O armazenamento é realizado em servidores seguros protegidos por criptografia e protocolos de acesso restrito.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">5. Contato</h2>
            <p>
              Caso tenha dúvidas sobre esta Política de Privacidade ou sobre o tratamento dos seus dados, entre em contato através da nossa <Link href="/contato" className="text-red-600 font-semibold hover:underline">página de contato</Link>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
