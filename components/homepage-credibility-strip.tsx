import { BookOpen, GraduationCap, MessageCircle } from "lucide-react";

const credibilityPoints = [
  {
    icon: GraduationCap,
    title: "Professor de inglês licenciado",
    description: "Formação docente voltada ao ensino da língua inglesa.",
  },
  {
    icon: BookOpen,
    title: "Trajetória na UFBA",
    description: "Estudos em Letras com Inglês e pesquisa linguística.",
  },
  {
    icon: MessageCircle,
    title: "Percurso por nível",
    description: "Aulas do A1 ao B2; materiais de apoio até C1 e C2.",
  },
];

export function HomepageCredibilityStrip() {
  return (
    <section
      aria-labelledby="homepage-credibility-title"
      className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-12">
        <h2 id="homepage-credibility-title" className="sr-only">
          Formação e percurso de aprendizagem
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3 sm:gap-0">
          {credibilityPoints.map(({ icon: Icon, title, description }, index) => (
            <li
              key={title}
              className={`flex items-start gap-3 py-2 sm:px-5 ${index > 0 ? "sm:border-l sm:border-slate-200 sm:dark:border-slate-800" : "sm:pl-0"} ${index === credibilityPoints.length - 1 ? "sm:pr-0" : ""}`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
                <Icon size={20} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
