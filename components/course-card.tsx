import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  id: number;
  level: string;
  title: string;
  description: string;
}

export function CourseCard({ id, level, title, description }: CourseCardProps) {
  return (
    <Link href={`/cursos/${id}`}>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-red-500 transition cursor-pointer h-full">
        <div className="text-red-500 font-bold text-lg mb-2">{level}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{description}</p>
        <Button variant="outline" className="w-full">
          Ver Detalhes
        </Button>
      </div>
    </Link>
  );
}
