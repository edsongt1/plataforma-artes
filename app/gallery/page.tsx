"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import Carousel from "@/components/Carousel";
import { Search, LogOut, ExternalLink, Package, Maximize2, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GalleryPage() {
  const { categories, artPacks, isLoaded } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/");
  };

  const filteredPacks = artPacks.filter((pack) => {
    const matchesCategory = selectedCategory === "all" || pack.categoryId === selectedCategory;
    const matchesSearch = pack.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-black">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Package size={24} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Minhas Artes</h1>
            </div>

            <div className="flex flex-1 max-w-md items-center relative">
              <Search className="absolute left-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar packs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-indigo-500 transition-all text-sm text-black"
              />
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === "all"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Art Packs Grid */}
        {filteredPacks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPacks.map((pack) => (
              <div
                key={pack.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col h-full"
              >
                {/* Mockup Carousel */}
                <div className="aspect-[4/3] relative bg-gray-200 overflow-hidden group/carousel">
                  {pack.mockupUrls && pack.mockupUrls.length > 0 ? (
                    <>
                      <Carousel images={pack.mockupUrls} duration={pack.duration} />
                      <button 
                        onClick={() => {
                          // Pega a imagem atual do carrossel (simplificado para a primeira ou lógica de índice se necessário)
                          // Para ser exato, vamos permitir clicar para abrir o modal
                          setSelectedImage(pack.mockupUrls[0]);
                        }}
                        className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10 text-indigo-600"
                        title="Ver maior"
                      >
                        <Maximize2 size={18} />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Sem Mockup
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{pack.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <span className="px-2 py-1 bg-gray-100 rounded-md">
                      {categories.find((c) => c.id === pack.categoryId)?.name || "Geral"}
                    </span>
                  </div>
                  
                  <div className="mt-auto">
                    <a
                      href={pack.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors group"
                    >
                      <span>Baixar Pack</span>
                      <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Nenhum pack encontrado</h3>
            <p className="text-gray-500">Tente ajustar seus filtros ou busca.</p>
          </div>
        )}
      </main>

      {/* Image Lightbox/Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage} 
              alt="Visualização ampliada" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
