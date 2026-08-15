"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Heart, Search, Filter, BookOpen, Star, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";

export default function WishlistPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [wishlistItems, setWishlistItems] = useState([
    {
      id: "c1",
      title: "Advanced English Syntax & Stylistics",
      category: "Gramática Avançada",
      level: "C1–C2",
      price: "R$ 397,00",
      rating: 4.9,
      reviewsCount: 42,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60",
    },
    {
      id: "c2",
      title: "Business & Corporate Presentation Mastery",
      category: "Business English",
      level: "B2–C1",
      price: "R$ 297,00",
      rating: 4.8,
      reviewsCount: 38,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=60",
    },
    {
      id: "c3",
      title: "Ethnic-Racial Literature & Critical Reading",
      category: "Leitura Crítica",
      level: "B1–B2",
      price: "Gratuito",
      rating: 5.0,
      reviewsCount: 19,
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=60",
    },
  ]);

  const handleRemove = (id: string) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id));
    toast.success("Curso removido da Lista de Desejos.");
  };

  const categories = ["all", "Gramática Avançada", "Business English", "Leitura Crítica"];

  const filteredItems = wishlistItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <Heart className="text-red-600 fill-red-600" size={32} /> Lista de Desejos
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Cursos salvos para matrícula futura, consulta e planejamento de estudos.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Buscar em sua lista de desejos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl border-gray-300"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedCategory === cat ? "bg-red-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat === "all" ? "Todas as Categorias" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
              Nenhum curso encontrado na sua lista de desejos para os filtros selecionados.
            </div>
          ) : (
            filteredItems.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between group">
                <div>
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <button
                      onClick={() => handleRemove(course.id)}
                      className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-red-600 flex items-center justify-center shadow-md hover:bg-white transition"
                    >
                      <Heart size={18} className="fill-red-600" />
                    </button>
                    <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-black/70 backdrop-blur-sm text-white">
                      {course.level}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider">{course.category}</span>
                    <h3 className="font-extrabold text-lg text-gray-900 leading-snug">{course.title}</h3>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star size={14} className="fill-amber-500" />
                      <span>{course.rating}</span>
                      <span className="text-gray-400 font-normal">({course.reviewsCount} avaliações)</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between border-t border-gray-100 mt-4">
                  <span className="font-extrabold text-lg text-gray-900">{course.price}</span>
                  <Link href={`/cursos/${course.id}`}>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl gap-2">
                      Ver Curso <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
