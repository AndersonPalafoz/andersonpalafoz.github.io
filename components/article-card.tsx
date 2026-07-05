import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  author: string;
}

export function ArticleCard({
  slug,
  title,
  excerpt,
  publishedAt,
  author,
}: ArticleCardProps) {
  return (
    <Link href={`/blog/${slug}`}>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-red-500 transition cursor-pointer h-full">
        <div className="text-gray-400 text-sm mb-3">
          <p>
            {publishedAt} • Por {author}
          </p>
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{excerpt}</p>
        <Button variant="outline" className="w-full">
          Ler Artigo
        </Button>
      </div>
    </Link>
  );
}
