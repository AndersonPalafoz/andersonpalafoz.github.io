export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export const metadata = {
  title: "Contato | Anderson Palafoz",
  description: "Entre em contato com Anderson Palafoz para dúvidas, sugestões ou parcerias.",
};

export default function ContatoPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto w-full">
          <div className="space-y-8 max-w-3xl">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Entre em
                <br />
                <span className="text-red-600">Contato</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Tem dúvidas, sugestões ou quer propor uma parceria? Adoraríamos ouvir de você!
              </p>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                  <a href="mailto:palafozanderson@gmail.com" className="text-gray-600 hover:text-red-600 transition">
                    palafozanderson@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">WhatsApp</h3>
                  <a href="https://wa.me/5571999999999" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600 transition">
                    (71) 99999-9999
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Localização</h3>
                  <p className="text-gray-600">Salvador, Bahia - Brasil</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Envie uma Mensagem</h2>

            <form className="space-y-6">
              {/* Nome */}
              <div>
                <label className="block text-gray-900 font-semibold mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  className="w-full px-6 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-900 font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full px-6 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Assunto */}
              <div>
                <label className="block text-gray-900 font-semibold mb-2">
                  Assunto
                </label>
                <select className="w-full px-6 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-red-600">
                  <option>Selecione um assunto</option>
                  <option>Dúvida sobre Cursos</option>
                  <option>Sugestão de Conteúdo</option>
                  <option>Parceria</option>
                  <option>Feedback</option>
                  <option>Outro</option>
                </select>
              </div>

              {/* Mensagem */}
              <div>
                <label className="block text-gray-900 font-semibold mb-2">
                  Mensagem
                </label>
                <textarea
                  placeholder="Sua mensagem aqui..."
                  rows={6}
                  className="w-full px-6 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-red-600 resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2">
                  <Send size={18} />
                  Enviar Mensagem
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Perguntas Frequentes
          </h2>

          <div className="space-y-6">
            {[
              {
                pergunta: "Qual é o tempo de resposta?",
                resposta: "Respondemos a todas as mensagens dentro de 24 horas úteis.",
              },
              {
                pergunta: "Vocês oferecem aulas particulares?",
                resposta: "Sim! Oferecemos aulas particulares personalizadas. Entre em contato para mais informações.",
              },
              {
                pergunta: "Como posso me inscrever em um curso?",
                resposta: "Você pode se inscrever diretamente na página de Aulas ou acessando sua Minha Área.",
              },
              {
                pergunta: "Há possibilidade de parcerias?",
                resposta: "Sim! Estamos abertos a parcerias educacionais. Envie um email com sua proposta.",
              },
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {item.pergunta}
                </h3>
                <p className="text-gray-600">{item.resposta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-red-600">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Pronto para Começar?
          </h2>
          <p className="text-lg text-red-100">
            Não espere mais! Entre em contato ou inscreva-se em um de nossos cursos agora mesmo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white hover:bg-gray-100 text-red-600 px-8 py-6 text-lg rounded-lg font-semibold">
              Enviar Mensagem
            </Button>
            <Button className="bg-red-700 hover:bg-red-800 text-white px-8 py-6 text-lg rounded-lg font-semibold">
              Ver Cursos
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
