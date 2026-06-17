"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import Carousel from "@/components/Carousel";
import { Search, LogOut, ExternalLink, Package, Maximize2, X, MessageCircle, Clock, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GalleryPage() {
  const { categories, artPacks, isLoaded, customSections, siteSettings, currentClient, fetchCurrentClient } = useStore();
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchCurrentClient(token);
    }
  }, [fetchCurrentClient]);

  useEffect(() => {
    const endDateVal = currentClient?.endDate;
    if (endDateVal) {
      const calculateDays = () => {
        const now = new Date();
        const endDate = new Date(endDateVal);
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysRemaining(Math.max(0, diffDays));
      };
      calculateDays();
      const interval = setInterval(calculateDays, 60000);
      return () => clearInterval(interval);
    } else {
      setDaysRemaining(null);
    }
  }, [currentClient?.endDate]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/");
  };

  useEffect(() => {
    if (searchTerm.trim()) {
      const matchingCategory = categories.find(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingCategory) {
        setSelectedSection(matchingCategory.id);
      }
    }
  }, [searchTerm, categories]);

  const filteredPacks = artPacks.filter((pack) => {
    const isCustomSection = customSections.some(s => s.id === selectedSection);
    if (isCustomSection) return false;

    const matchesCategory = selectedSection === "all" || pack.categoryId === selectedSection;
    const category = categories.find(c => c.id === selectedSection);
    const searchMatchesCategory = category && category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = !searchTerm.trim() || searchMatchesCategory || pack.title.toLowerCase().includes(searchTerm.toLowerCase());

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
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 bg-gray-100 rounded-lg"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Days Counter */}
              {daysRemaining !== null && (
                <div className={`px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${
                  daysRemaining <= 5 ? 'bg-red-100 text-red-700' : 
                  daysRemaining <= 15 ? 'bg-amber-100 text-amber-700' : 
                  'bg-green-100 text-green-700'
                }`}>
                  <Clock size={18} />
                  FALTAM {daysRemaining} {daysRemaining === 1 ? 'DIA' : 'DIAS'}
                </div>
              )}

              {/* Logo */}
              <div className="flex items-center gap-2">
                {siteSettings?.logoUrl ? (
                  <img src={siteSettings.logoUrl} alt="Logo" className="h-10 object-contain" />
                ) : (
                  <div className="bg-indigo-600 p-2 rounded-lg text-white">
                    <Package size={20} />
                  </div>
                )}
                <h1 className="text-lg font-bold text-gray-900">Minhas Artes</h1>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-1 max-w-md items-center relative">
              <Search className="absolute left-3 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar packs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-indigo-500 transition-all text-sm text-black"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {siteSettings?.whatsappLink && (
                <a
                  href={siteSettings.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <MessageCircle size={16} />
                  <span className="hidden sm:inline">Preciso de Ajuda</span>
                </a>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-120px)]">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed md:relative z-30 h-[calc(100vh-120px)] bg-white shadow-lg 
          w-72 md:w-64 border-r border-gray-200 overflow-y-auto
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-4 space-y-1">
            {/* Custom Sections */}
            {customSections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setSelectedSection(section.id);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm ${
                  selectedSection === section.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {section.icon} {section.name.toUpperCase()}
              </button>
            ))}
            <button
              onClick={() => {
                setSelectedSection("all");
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm ${
                selectedSection === "all"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              📁 Todos
            </button>
            <div className="border-t border-gray-200 my-2"></div>
            {/* Categories */}
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedSection(category.id);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm ${
                  selectedSection === category.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                📂 {category.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50 overflow-y-auto">
          {/* Section Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
            {selectedSection === "all" ? "Todos os Packs" : 
             customSections.find(s => s.id === selectedSection)?.name || 
             categories.find(c => c.id === selectedSection)?.name}
          </h2>

          {/* Custom Section Items */}
          {(() => {
            const section = customSections.find(s => s.id === selectedSection);
            
            if (section) {
              const items = section.items || [];
              
              if (items.length > 0) {
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {items.map((item: any) => (
                      <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                        {item.image_url && (
                          <img src={item.image_url} alt={item.title} className="w-full h-40 sm:h-48 object-cover" />
                        )}
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base">{item.title}</h3>
                          {item.description && (
                            <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-3">{item.description}</p>
                          )}
                          {item.link && (
                            <div className="mt-auto">
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors group text-sm"
                              >
                                <span>Acessar</span>
                                <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              } else {
                return (
                  <div className="text-center py-12 sm:py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
                    <div className="mx-auto w-12 sm:w-16 h-12 sm:h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                      <Search size={24} className="sm:w-8 sm:h-8" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">Nenhum item nesta seção</h3>
                  </div>
                );
              }
            } else {
              // Normal Art Packs Section
              return (
                filteredPacks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                    {filteredPacks.map((pack) => (
                      <div
                        key={pack.id}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col h-full"
                      >
                        <div className="aspect-[4/3] relative bg-gray-200 overflow-hidden group/carousel">
                          {pack.mockupUrls && pack.mockupUrls.length > 0 ? (
                            <>
                              <Carousel images={pack.mockupUrls} duration={pack.duration} />
                              <button 
                                onClick={() => {
                                  setSelectedImage(pack.mockupUrls[0]);
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10 text-indigo-600"
                                title="Ver maior"
                              >
                                <Maximize2 size={16} />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              Sem Mockup
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base">{pack.title}</h3>
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
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors group text-sm"
                            >
                              <span>Baixar Pack</span>
                              <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 sm:py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
                    <div className="mx-auto w-12 sm:w-16 h-12 sm:h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                      <Search size={24} className="sm:w-8 sm:h-8" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">Nenhum pack encontrado</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">Tente ajustar seus filtros ou busca.</p>
                  </div>
                )
              );
            }
          })()}
        </main>
      </div>

      {/* Full Screen Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
          <img src={selectedImage} alt="Imagem ampliada" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
}
