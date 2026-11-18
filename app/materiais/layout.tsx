import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Materiais de inglês | Anderson Palafoz",
  description:
    "Acesse materiais de inglês organizados por nível e categoria, além de guias autorais de gramática para apoiar seus estudos.",
  alternates: {
    canonical: "/materiais",
  },
};

export default function MateriaisLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
