"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";

export default function ContatoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simular envio
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    alert("Mensagem enviada com sucesso!");
  };

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="pt-32 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Entre em <span className="text-primary">Contato</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Tem dúvidas? Quer saber mais sobre os cursos? Fale conosco!
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Formulário */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Envie uma Mensagem
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome
                </label>
                <Input
                  type="text"
                  placeholder="Seu nome"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Assunto
                </label>
                <Input
                  type="text"
                  placeholder="Assunto da mensagem"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mensagem
                </label>
                <Textarea
                  placeholder="Sua mensagem aqui..."
                  required
                  rows={6}
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
              </Button>
            </form>
          </div>

          {/* Informações de Contato */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Informações de Contato
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Email</h3>
                  <a
                    href="mailto:palafozanderson@gmail.com"
                    className="text-muted-foreground hover:text-primary"
                  >
                    palafozanderson@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">WhatsApp</h3>
                  <a
                    href="https://wa.me/5571999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    (71) 99999-9999
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Localização</h3>
                  <p className="text-muted-foreground">
                    Salvador, Bahia, Brasil
                  </p>
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="pt-6 border-t border-border">
              <h3 className="font-semibold text-foreground mb-4">
                Redes Sociais
              </h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition"
                >
                  <span className="text-primary font-bold">f</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition"
                >
                  <span className="text-primary font-bold">𝕏</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition"
                >
                  <span className="text-primary font-bold">in</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
