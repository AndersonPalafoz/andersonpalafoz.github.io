"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">AP</span>
              </div>
              <span className="font-bold">Anderson Palafoz</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Plataforma educacional para ensino de inglês de alta qualidade.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sobre" className="text-muted-foreground hover:text-foreground">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/aulas" className="text-muted-foreground hover:text-foreground">
                  Aulas
                </Link>
              </li>
              <li>
                <Link href="/materiais" className="text-muted-foreground hover:text-foreground">
                  Materiais
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold">Recursos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                  Minha Área
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-muted-foreground hover:text-foreground">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contato</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <a
                  href="mailto:palafozanderson@gmail.com"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Email
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <a
                  href="https://wa.me/5571999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                <span className="text-muted-foreground">Salvador, BA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/40 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Anderson Palafoz. Todos os direitos reservados.
            </p>
            <p className="text-sm text-muted-foreground italic">
              "Tudo quanto fizerdes, fazei-o de todo coração, como para o
              Senhor, e não para homens." — Colossenses 3:23
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
