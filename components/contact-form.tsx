"use client";

import React, { FormEvent, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import {
  buildContactMailto,
  CONTACT_EMAIL,
  CONTACT_WHATSAPP_URL,
} from "@/lib/contact";

const SUBJECT_OPTIONS = [
  "Dúvida sobre cursos",
  "Agendamento de aula presencial",
  "Aulas particulares personalizadas",
  "Sugestão de conteúdo",
  "Parceria",
  "Feedback",
  "Outro assunto",
];

const SUBMIT_DELAY_MS = 350;
type FormStatus = "idle" | "success" | "error";

type ContactFormContext = {
  courseId: number;
  courseName: string;
  courseType: 3 | 5;
  initialSubject: string;
  initialMessage: string;
};

type ContactFormProps = {
  onMailto?: (mailto: string) => void;
  courseContext?: ContactFormContext;
};

export function ContactForm({ onMailto, courseContext }: ContactFormProps) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const values = new FormData(form);
    const name = String(values.get("name") ?? "").trim();
    const email = String(values.get("email") ?? "").trim();
    const subject = String(values.get("subject") ?? "").trim();
    const message = String(values.get("message") ?? "").trim();

    setStatus("idle");
    setIsSubmitting(true);

    try {
      if (!name || !email || !subject || message.length < 10) {
        setStatus("error");
        return;
      }

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, SUBMIT_DELAY_MS);
      });

      const mailto = buildContactMailto({ name, email, subject, message });
      (onMailto ?? ((url: string) => { window.location.href = url; }))(mailto);
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:p-8 lg:p-10">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-red-600">
          Formulário de contato
        </p>
        <h2 className="text-3xl font-bold text-[#1F1F1F]">Envie uma mensagem</h2>
              <p className="mt-3 text-base leading-7 text-gray-600">
          Preencha os campos abaixo. Seu aplicativo de email será aberto com a mensagem pronta para envio.
        </p>
              {courseContext && (
                <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-800" role="note">
                  Esta mensagem está contextualizada para o curso <strong>{courseContext.courseName}</strong>. Você poderá revisar tudo antes de enviar.
                </p>
              )}
      </div>

      <form className="space-y-6" onSubmit={handleSubmit} aria-busy={isSubmitting}>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
              Nome completo <span className="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Seu nome"
              required
              minLength={2}
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
              Email <span className="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              required
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-subject" className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
            Assunto <span className="text-red-600" aria-hidden="true">*</span>
          </label>
            <select
            id="contact-subject"
            name="subject"
            defaultValue={courseContext?.initialSubject ?? ""}
            required
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-[#1F1F1F] outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-50"
          >
            <option value="" disabled>Selecione um assunto</option>
            {SUBJECT_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
            Mensagem <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            placeholder="Escreva sua mensagem..."
            defaultValue={courseContext?.initialMessage ?? ""}
            required
            minLength={10}
            rows={6}
            disabled={isSubmitting}
            className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-50"
          />
          <p className="mt-2 text-xs text-gray-500">Mínimo de 10 caracteres.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#D62828] px-6 py-3 font-semibold text-white transition hover:bg-[#B91C1C] focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 disabled:hover:bg-[#D62828]"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                Preparando mensagem...
              </>
            ) : (
              <>
                <Send size={18} aria-hidden="true" />
                Enviar por email
              </>
            )}
          </button>
          <a
            href={CONTACT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-sm font-semibold text-red-600 underline-offset-4 transition hover:text-[#B91C1C] hover:underline focus:outline-none focus:ring-2 focus:ring-red-200 sm:text-left"
          >
            Prefere WhatsApp? Fale diretamente
          </a>
        </div>

        {isSubmitting && (
          <p role="status" aria-live="polite" className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-800">
            <Loader2 size={18} className="mt-0.5 shrink-0 animate-spin" aria-hidden="true" />
            Preparando sua mensagem e abrindo o aplicativo de email...
          </p>
        )}
        {!isSubmitting && status === "success" && (
          <p role="status" aria-live="polite" className="flex items-start gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-800">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            Mensagem preparada com sucesso. Se o aplicativo de email não abriu, escreva diretamente para {CONTACT_EMAIL}.
          </p>
        )}
        {!isSubmitting && status === "error" && (
          <p role="alert" aria-live="assertive" className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            Não foi possível preparar sua mensagem. Confira os campos obrigatórios e tente novamente.
          </p>
        )}
      </form>
    </div>
  );
}
