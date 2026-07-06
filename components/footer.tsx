import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image src="/logo-horizontal.png" alt="Anderson Palafoz" width={160} height={50} className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed">
              Plataforma educacional completa para ensino de inglês de alta qualidade, com cursos, materiais e conteúdo acadêmico.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 pt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-600 transition"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-600 transition"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-600 transition"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">Navegação</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-red-600 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-gray-600 hover:text-red-600 transition">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/aulas" className="text-gray-600 hover:text-red-600 transition">
                  Aulas
                </Link>
              </li>
              <li>
                <Link href="/materiais" className="text-gray-600 hover:text-red-600 transition">
                  Materiais
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-red-600 transition">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">Recursos</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-red-600 transition">
                  Minha Área
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-gray-600 hover:text-red-600 transition">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-red-600 transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/politica-privacidade" className="text-gray-600 hover:text-red-600 transition">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <a href="mailto:palafozanderson@gmail.com" className="text-gray-600 hover:text-red-600 transition break-all">
                  palafozanderson@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <a href="https://wa.me/5571999999999" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600 transition">
                  (71) 99999-9999
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">Salvador, Bahia - Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-8 space-y-4">
          {/* Verse */}
          <div className="text-center text-gray-600 italic text-sm">
            <p>
              "Tudo quanto fizerdes, fazei-o de todo coração, como para o Senhor, e não para homens." — Colossenses 3:23
            </p>
          </div>

          {/* Copyright */}
          <div className="text-center text-gray-500 text-sm">
            <p>© 2024 Anderson Palafoz. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
