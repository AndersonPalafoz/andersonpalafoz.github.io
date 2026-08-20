import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { getCourseById } from "@/lib/db";
import {
  CONTACT_EMAIL,
  CONTACT_LOCATION,
  CONTACT_LOCATION_URL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_WHATSAPP_URL,
} from "@/lib/contact";

export const metadata = {
  title: "Contato | Anderson Palafoz",
  description:
    "Entre em contato com Anderson Palafoz para dúvidas, sugestões, aulas e parcerias educacionais.",
  alternates: {
    canonical: "/contato",
  },
};

const faqItems = [
  {
    pergunta: "Qual é o tempo de resposta?",
    resposta: "Normalmente respondemos em até 24 horas úteis.",
  },
  {
    pergunta: "Vocês oferecem aulas particulares?",
    resposta:
      "Sim. Envie uma mensagem contando seu objetivo, nível de inglês e disponibilidade para receber orientações sobre as aulas.",
  },
  {
    pergunta: "Como posso conhecer os cursos?",
    resposta:
      "Acesse a página de aulas para conhecer as modalidades, o público-alvo e a proposta pedagógica da plataforma.",
  },
  {
    pergunta: "Há possibilidade de parcerias?",
    resposta:
      "Sim. Parcerias educacionais, projetos e propostas de conteúdo podem ser enviados pelo formulário ou por email.",
  },
];

type ContactPageProps = {
  searchParams?: Promise<{ curso?: string | string[] }>;
};

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ContatoPage({ searchParams }: ContactPageProps) {
  const params = searchParams ? await searchParams : {};
  const courseId = Number(firstParam(params.curso));
  let courseContext: {
    courseId: number;
    courseName: string;
    courseType: 3 | 5;
    initialSubject: string;
    initialMessage: string;
  } | undefined;

  if (Number.isInteger(courseId) && courseId > 0) {
    const course = await getCourseById(courseId).catch(() => null);
    const courseType = Number(course?.courseType);
    if (course && (courseType === 3 || courseType === 5)) {
      const normalizedType = courseType as 3 | 5;
      courseContext = {
        courseId: course.id,
        courseName: course.title,
        courseType: normalizedType,
        initialSubject: normalizedType === 5 ? "Agendamento de aula presencial" : "Aulas particulares personalizadas",
        initialMessage: normalizedType === 5
          ? `Olá, Anderson. Tenho interesse em agendar uma aula presencial relacionada ao curso \"${course.title}\" (ID ${course.id}). Gostaria de saber sobre disponibilidade, local e próximos passos.`
          : `Olá, Anderson. Tenho interesse em um percurso particular personalizado relacionado ao curso \"${course.title}\" (ID ${course.id}). Gostaria de conversar sobre meu objetivo, nível e disponibilidade.`,
      };
    }
  }

  return (
    <main className="w-full bg-white text-[#1F1F1F] dark:text-slate-100 dark:bg-slate-950 dark:text-slate-100">
      <section className="relative overflow-hidden bg-[#F8F9FA] dark:bg-slate-900 px-4 py-20 sm:px-6 md:px-8 lg:px-16 lg:py-28 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-20">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
                Vamos conversar
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Fale com o
                <span className="block text-[#D62828]">Anderson Palafoz</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-slate-300">
                Tem uma dúvida sobre cursos, uma sugestão ou uma proposta de parceria? Escolha o canal mais conveniente e envie sua mensagem.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#D62828] px-5 py-3 font-semibold text-white transition hover:bg-[#B91C1C] focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2 active:scale-[0.98]"
                >
                  <Mail size={18} aria-hidden="true" />
                  Enviar email
                </a>
                <a
                  href={CONTACT_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-red-600 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/40 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2 active:scale-[0.98]"
                >
                  <MessageCircle size={18} aria-hidden="true" />
                  Falar no WhatsApp
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:p-8 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-600">
                Atendimento
              </p>
              <h2 className="mt-3 text-2xl font-bold text-[#1F1F1F] dark:text-slate-100">
                Um canal aberto para sua jornada
              </h2>
              <p className="mt-3 leading-7 text-gray-600 dark:text-slate-300">
                Seja para começar a estudar inglês ou desenvolver um projeto educacional, sua mensagem será recebida com atenção.
              </p>
              <div className="mt-6 flex items-start gap-3 border-t border-gray-100 dark:border-slate-800 pt-6">
                <Clock3 className="mt-0.5 shrink-0 text-red-600" size={20} aria-hidden="true" />
                <div>
                  <p className="font-semibold text-[#1F1F1F] dark:text-slate-100">Tempo de resposta</p>
                  <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-slate-300">Até 24 horas úteis, normalmente.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="mensagem" className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 md:px-8 lg:px-16 lg:py-24 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-20">
          <div className="lg:sticky lg:top-28">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-red-600">
              Encontre o melhor canal
            </p>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              Escolha como prefere falar
            </h2>
            <p className="mt-4 max-w-md leading-7 text-gray-600 dark:text-slate-300">
              Para assuntos mais detalhados, use o formulário. Se preferir uma conversa rápida, o WhatsApp é o caminho mais direto.
            </p>

            <div className="mt-8 space-y-4">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="group flex items-start gap-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-[#F8F9FA] dark:bg-slate-900 p-5 transition hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <Mail size={20} aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold text-[#1F1F1F] dark:text-slate-100">Email</span>
                  <span className="mt-1 block break-all text-sm text-gray-600 dark:text-slate-300 group-hover:text-red-600">{CONTACT_EMAIL}</span>
                </span>
              </a>

              <a
                href={CONTACT_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-[#F8F9FA] dark:bg-slate-900 p-5 transition hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <Phone size={20} aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold text-[#1F1F1F] dark:text-slate-100">WhatsApp</span>
                  <span className="mt-1 block text-sm text-gray-600 dark:text-slate-300 group-hover:text-red-600">{CONTACT_PHONE_DISPLAY}</span>
                </span>
              </a>

              <a
                href={CONTACT_LOCATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-[#F8F9FA] dark:bg-slate-900 p-5 transition hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <MapPin size={20} aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold text-[#1F1F1F] dark:text-slate-100">Localização</span>
                  <span className="mt-1 block text-sm text-gray-600 dark:text-slate-300 group-hover:text-red-600">{CONTACT_LOCATION}</span>
                </span>
              </a>
            </div>
          </div>

          <ContactForm courseContext={courseContext} />
          </div>

          <div id="faq" className="mx-auto mt-16 max-w-4xl scroll-mt-24 lg:mt-20">
            <div className="mb-10 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-red-600">Dúvidas comuns</p>
              <h2 className="text-3xl font-bold sm:text-4xl">Perguntas frequentes</h2>
              <p className="mx-auto mt-3 max-w-2xl leading-7 text-gray-600 dark:text-slate-300">
                Encontre respostas rápidas antes de enviar sua mensagem.
              </p>
            </div>
            <div className="space-y-3">
              {faqItems.map((item) => (
                <details key={item.pergunta} className="group rounded-2xl border border-gray-200 dark:border-slate-800 bg-[#F8F9FA] dark:bg-slate-900 px-5 py-4 shadow-sm transition open:border-red-200 sm:px-6">
                  <summary className="cursor-pointer list-none pr-8 font-semibold text-[#1F1F1F] dark:text-slate-100 outline-none transition marker:hidden focus-visible:ring-2 focus-visible:ring-red-200 [&::-webkit-details-marker]:hidden">
                    <span className="relative block after:absolute after:right-0 after:top-1/2 after:text-2xl after:font-normal after:text-red-600 after:content-['+'] after:-translate-y-1/2 group-open:after:content-['−']">
                      {item.pergunta}
                    </span>
                  </summary>
                  <p className="max-w-3xl pt-3 leading-7 text-gray-600 dark:text-slate-300">{item.resposta}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#D62828] px-4 py-16 sm:px-6 md:px-8 lg:px-16 lg:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Pronto para começar?</h2>
            <p className="mt-3 max-w-2xl text-lg leading-7 text-red-100">
              Conheça as aulas ou envie uma mensagem para conversar sobre seu próximo passo.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href="#mensagem"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/40 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600 active:scale-[0.98]"
            >
              Enviar mensagem
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <Link
              href="/aulas"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/80 px-5 py-3 font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600 active:scale-[0.98]"
            >
              Ver aulas
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
