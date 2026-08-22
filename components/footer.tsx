import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, ArrowUpRight } from "lucide-react";
import { BRAND_ASSETS } from "@/lib/brand-assets";

const navigation = [
  ["Home", "/"],
  ["Sobre", "/sobre"],
  ["Cursos", "/cursos"],
  ["Materiais", "/materiais"],
  ["Blog", "/blog"],
] as const;

const resources = [
  ["Minha Área", "/dashboard"],
  ["Contato", "/contato"],
  // Rotas públicas de suporte: <Link href="/faq" /> e <Link href="/politica-privacidade" />
  ["Perguntas frequentes", "/faq"],
  ["Política de Privacidade", "/politica-privacidade"],
] as const;

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute -right-32 -top-40 h-80 w-80 rounded-full bg-red-600/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.8fr_0.9fr_1.2fr] lg:gap-14">
          <div className="max-w-sm space-y-5">
            <Link href="/" className="inline-flex rounded-xl bg-white px-3 py-2 transition hover:-translate-y-0.5 hover:shadow-lg" aria-label="Anderson Palafoz — início">
              <img src={BRAND_ASSETS.horizontal} alt="Anderson Palafoz — Professor de Inglês" width={1809} height={555} className="h-9 w-auto max-w-full object-contain" loading="lazy" />
            </Link>
            <p className="text-sm leading-7 text-slate-300">Ensino de inglês, materiais autorais e formação acadêmica para aprender com clareza, prática e propósito.</p>
            <div className="flex items-center gap-2 pt-1">
              <a href="https://www.facebook.com/APalafoz/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300"><Facebook size={18} /></a>
              <a href="http://instagram.com/andersonpalafoz" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300"><Instagram size={18} /></a>
              <a href="https://www.linkedin.com/in/andersonpalafoz/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300"><Linkedin size={18} /></a>
            </div>
          </div>

          <div><h2 className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Navegação</h2><ul className="mt-5 space-y-3">{navigation.map(([label, href]) => <li key={href}><Link href={href} className="group inline-flex items-center gap-1 text-sm text-slate-300 transition hover:text-white">{label}<ArrowUpRight size={13} className="opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" /></Link></li>)}</ul></div>
          <div><h2 className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Recursos</h2><ul className="mt-5 space-y-3">{resources.map(([label, href]) => <li key={href}><Link href={href} className="group inline-flex items-center gap-1 text-sm text-slate-300 transition hover:text-white">{label}<ArrowUpRight size={13} className="opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" /></Link></li>)}</ul></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6"><h2 className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Fale comigo</h2><ul className="mt-5 space-y-4 text-sm"> <li className="flex items-start gap-3"><Mail size={18} className="mt-0.5 shrink-0 text-red-300" /><a href="mailto:palafozanderson@gmail.com" className="break-all text-slate-200 transition hover:text-white">palafozanderson@gmail.com</a></li><li className="flex items-start gap-3"><Phone size={18} className="mt-0.5 shrink-0 text-red-300" /><a href="https://wa.me/5571991222257" target="_blank" rel="noopener noreferrer" className="text-slate-200 transition hover:text-white">(71) 9 9122-2257</a></li><li className="flex items-start gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-red-300" /><span className="text-slate-200">Salvador, Bahia — Brasil</span></li></ul></div>
        </div>

        <div className="mt-12 grid gap-5 border-t border-white/10 pt-7 text-center sm:grid-cols-[1fr_auto] sm:text-left"><p className="text-sm italic leading-6 text-slate-400">“Tudo quanto fizerdes, fazei-o de todo coração, como para o Senhor.”<span className="not-italic text-slate-500"> — Colossenses 3:23</span></p><p className="text-xs text-slate-500 sm:text-right">© 2026 Anderson Palafoz.<br className="sm:hidden" /> Todos os direitos reservados.</p></div>
      </div>
    </footer>
  );
}
