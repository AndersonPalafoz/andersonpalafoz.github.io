import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-800 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">AP</span>
              </div>
              <span className="font-bold text-white">Anderson Palafoz</span>
            </div>
            <p className="text-sm text-gray-400">
              Plataforma educacional para ensino de inglês de alta qualidade.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sobre" className="text-gray-400 hover:text-red-500">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/aulas" className="text-gray-400 hover:text-red-500">
                  Aulas
                </Link>
              </li>
              <li>
                <Link href="/materiais" className="text-gray-400 hover:text-red-500">
                  Materiais
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-red-500">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Recursos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-red-500">
                  Minha Área
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-gray-400 hover:text-red-500">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-400">
                <Mail size={16} className="text-red-500" />
                <a href="mailto:palafozanderson@gmail.com" className="hover:text-red-500">
                  palafozanderson@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Phone size={16} className="text-red-500" />
                <a href="https://wa.me/5571999999999" className="hover:text-red-500">
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <MapPin size={16} className="text-red-500" />
                <span>Salvador, BA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8 space-y-4">
          {/* Verse */}
          <div className="text-center text-gray-400 italic text-sm">
            <p>
              "Tudo quanto fizerdes, fazei-o de todo coração, como para o Senhor,
              e não para homens." — Colossenses 3:23
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
