import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Integrar com API real de envio de email
      // Por enquanto, simular sucesso
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error("Erro ao enviar mensagem. Tente novamente mais tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-light to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Entre em Contato
            </h1>
            <p className="text-lg text-muted-foreground">
              Tire suas dúvidas ou envie uma mensagem
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-foreground">
                Informações de Contato
              </h2>

              <div className="space-y-6">
                {[
                  {
                    icon: Mail,
                    title: "Email",
                    value: "contato@andersonpalafoz.com",
                    href: "mailto:contato@andersonpalafoz.com",
                  },
                  {
                    icon: MessageSquare,
                    title: "WhatsApp",
                    value: "Enviar Mensagem",
                    href: "https://wa.me/5511999999999",
                  },
                  {
                    icon: Phone,
                    title: "Telefone",
                    value: "(11) 9 9999-9999",
                    href: "tel:+5511999999999",
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Card key={idx}>
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                            <a
                              href={item.href}
                              className="text-sm text-primary hover:text-primary-hover transition-colors"
                              aria-label={`Contato via ${item.title}`}
                            >
                              {item.value}
                            </a>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Enviar Mensagem</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Seu nome"
                        required
                        aria-required="true"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="seu@email.com"
                        required
                        aria-required="true"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">Assunto</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Assunto da mensagem"
                        required
                        aria-required="true"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Mensagem</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Sua mensagem aqui..."
                        rows={5}
                        required
                        aria-required="true"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary hover:bg-primary-hover text-white disabled:opacity-50"
                    >
                      {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Perguntas Frequentes
          </h2>

          <div className="space-y-6">
            {[
              {
                question: "Qual é o tempo de resposta?",
                answer:
                  "Respondemos mensagens em até 24 horas úteis. Para urgências, use o WhatsApp.",
              },
              {
                question: "Como faço para me inscrever em um curso?",
                answer:
                  "Você pode se inscrever diretamente na página de Aulas após fazer login na plataforma.",
              },
              {
                question: "Há certificado ao final do curso?",
                answer:
                  "Sim! Todos os alunos que completarem o curso recebem um certificado de conclusão.",
              },
              {
                question: "Posso acessar os materiais offline?",
                answer:
                  "Os materiais podem ser baixados para acesso offline. Consulte a página de Materiais.",
              },
            ].map((item, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="font-semibold text-foreground">{item.question}</h3>
                <p className="text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
