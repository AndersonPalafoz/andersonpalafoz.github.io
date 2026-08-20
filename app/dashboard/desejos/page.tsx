"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, Search, ShoppingCart, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";
import { SavedMaterialsSection } from "@/components/saved-materials-section";

type WishlistCourse = {
  id: number;
  title: string;
  level: string;
  category?: string | null;
  isFree: boolean;
  price: string | number | null;
  imageUrl?: string | null;
  description?: string | null;
};

type WishlistItem = {
  id: number;
  course: WishlistCourse | null;
};

function formatPrice(course: WishlistCourse) {
  return course.isFree
    ? "Gratuito"
    : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(course.price || 0));
}

export default function WishlistPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/wishlist")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Não foi possível carregar a lista.");
        return data;
      })
      .then((data) => setItems(data.items || []))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    return ["all", ...Array.from(new Set(items.map((item) => item.course?.category || "Sem categoria")))];
  }, [items]);

  const filteredItems = items.filter((item) => {
    const course = item.course;
    if (!course) return false;
    const category = course.category || "Sem categoria";
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  async function remove(courseId: number, courseTitle: string) {
    setRemoving(courseId);
    try {
      const response = await fetch(`/api/wishlist?courseId=${courseId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível remover o curso.");
      
      setItems((current) => current.filter((item) => item.course?.id !== courseId));
      toast.success(`Curso "${courseTitle}" removido da sua Lista de Desejos.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao remover curso da lista.");
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12 font-sans">
      <div className="border-b border-border pb-6">
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-foreground">
          <Heart className="fill-red-600 text-red-600" size={32} /> Lista de Desejos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Cursos salvos para matrícula futura, consulta e planejamento de estudos.</p>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:flex-row">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-xl border-border pl-10 bg-background text-foreground"
          />
        </div>
        <div className="flex w-full flex-wrap gap-2 md:w-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                selectedCategory === category
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {category === "all" ? "Todas as categorias" : category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center rounded-2xl border border-border bg-card p-12">
          <Loader2 className="animate-spin text-red-600" size={32} />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
          Sua Lista de Desejos ainda não possui cursos para estes filtros.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map(({ id, course }) => course && (
            <article key={id} className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
              <div>
                <div className="relative h-48 overflow-hidden bg-red-50 dark:bg-red-950/20">
                  {course.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.imageUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-red-600">
                      <Heart size={42} />
                    </div>
                  )}
                  <button
                    onClick={() => void remove(course.id, course.title)}
                    disabled={removing === course.id}
                    aria-label={`Remover ${course.title}`}
                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-red-600 shadow-md transition hover:bg-background disabled:opacity-50"
                  >
                    {removing === course.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} className="text-red-600" />}
                  </button>
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">
                    {course.level}
                  </span>
                </div>
                <div className="space-y-3 p-6">
                  <h2 className="text-lg font-black leading-snug text-foreground">{course.title}</h2>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{course.description || "Curso de inglês da plataforma Anderson Palafoz."}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-border p-6 pt-4">
                <span className="font-black text-foreground">{formatPrice(course)}</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void remove(course.id, course.title)}
                    disabled={removing === course.id}
                    className="rounded-xl text-xs gap-1 border-border text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    {removing === course.id ? <Loader2 className="animate-spin" size={13} /> : <Trash2 size={13} />} Remover
                  </Button>
                  <Link href={`/cursos/${course.id}`}>
                    <Button size="sm" className="gap-1 rounded-xl bg-red-600 text-xs text-white hover:bg-red-700">
                      {course.isFree ? "Ver curso" : "Comprar Agora"} <ShoppingCart size={14} />
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <SavedMaterialsSection />
    </div>
  );
}
