import Link from "next/link";
import { Button } from "@/components/ui/button";

interface MaterialCardProps {
  id: number;
  title: string;
  type: string;
  level: string;
  description: string;
}

export function MaterialCard({
  id,
  title,
  type,
  level,
  description,
}: MaterialCardProps) {
  return (
    <Link href={`/materiais/${id}`}>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-red-500 transition cursor-pointer h-full">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-red-500 font-bold">{type}</p>
            <p className="text-gray-400 text-sm">{level}</p>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{description}</p>
        <Button variant="outline" className="w-full">
          Ver Material
        </Button>
      </div>
    </Link>
  );
}
