import { PROFESSOR_NAME, BIBLE_VERSE } from "@/constants";
import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card mt-20">
      <div className="container py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">
              {PROFESSOR_NAME}
            </h3>
            <p className="text-sm text-muted-foreground">
              Plataforma educacional para ensino de inglês, materiais pedagógicos e conteúdo acadêmico.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Navegação</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-muted-foreground hover:text-primary transition-colors">
                  Aulas
                </Link>
              </li>
              <li>
                <Link href="/materials" className="text-muted-foreground hover:text-primary transition-colors">
                  Materiais
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Recursos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contato</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="mailto:contato@andersonpalafoz.com" className="hover:text-primary transition-colors">
                  contato@andersonpalafoz.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {currentYear} {PROFESSOR_NAME}. Todos os direitos reservados.
          </p>

          {/* Bible Verse - Discrete */}
          <div className="text-xs text-muted-foreground italic text-center md:text-right">
            <p>{BIBLE_VERSE.text}</p>
            <p className="mt-1 text-[11px]">
              "{BIBLE_VERSE.fullText}"
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
