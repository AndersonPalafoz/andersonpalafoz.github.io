import { ProfessorMobileNav } from "@/components/professor-mobile-nav";

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-24 text-foreground md:pb-0">
      {children}
      <ProfessorMobileNav />
    </div>
  );
}
