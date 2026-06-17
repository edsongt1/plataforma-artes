"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Plus, Edit2, Trash2, Layout, Image as ImageIcon, ExternalLink, X, LogOut, Upload, Users, Copy, Check, Power, PowerOff, Calendar, Phone, RefreshCw, Search, Settings, Tag } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { 
    categories, addCategory, updateCategory, deleteCategory,
    artPacks, addArtPack, updateArtPack, deleteArtPack,
    clients, addClient, deleteClient, toggleClientStatus, renewSubscription,
    uploadMockup,
    promotions, addPromotion, updatePromotion, deletePromotion,
    customSections, addCustomSection, updateCustomSection, deleteCustomSection,
    addSectionItem, updateSectionItem, deleteSectionItem,
    siteSettings, updateSiteSettings,
    isLoaded 
  } = useStore();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"packs" | "categories" | "clients" | "promotions" | "settings" | "sections">("packs");
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<any>(null);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [sectionForm, setSectionForm] = useState({ name: "", icon: "" });
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [currentSectionForItems, setCurrentSectionForItems] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({ title: "", description: "", imageUrl: "", link: "" });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [packForm, setPackForm] = useState({ 
    title: "", 
    mockupUrls: [] as string[], 
    downloadUrl: "", 
    categoryId: "",
    duration: 3 
  });
  const [catForm, setCatForm] = useState({ name: "" });
  const [clientForm, setClientForm] = useState({ 
    name: "", 
    phone: "", 
    startDate: new Date().toISOString().split('T')[0],
    duration: 1 // 1 mês por padrão
  });
  const [promotionForm, setPromotionForm] = useState({ 
    title: "", 
    price: "", 
    imageUrl: "", 
    link: "",
    position: "left" as "left" | "right"
  });
  
  const [whatsappForm, setWhatsappForm] = useState("");
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });

  // Initialize form values when siteSettings loads
  useEffect(() => {
    if (siteSettings) {
      setWhatsappForm(siteSettings.whatsappLink || "");
    }
  }, [siteSettings]);

  if (!isLoaded) return <div className="p-8 text-center">Carregando painel...</div>;

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/");
  };

  const copyToClipboard = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const publicUrl = await uploadMockup(file);
      
      if (packForm.mockupUrls.length >= 10) {
        alert("Máximo de 10 fotos atingido.");
        return;
      }
      setPackForm({ ...packForm, mockupUrls: [...packForm.mockupUrls, publicUrl] });
    } catch (error: any) {
      alert("Erro no upload: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSavePack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (packForm.mockupUrls.length === 0) {
      alert("Adicione pelo menos uma imagem.");
      return;
    }
    setIsSaving(true);
    try {
      if (editingPack) {
        await updateArtPack(editingPack.id, packForm);
      } else {
        await addArtPack(packForm);
      }
      setIsPackModalOpen(false);
      setEditingPack(null);
      setPackForm({ title: "", mockupUrls: [], downloadUrl: "", categoryId: "", duration: 3 });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, catForm.name);
      } else {
        await addCategory(catForm.name);
      }
      setIsCatModalOpen(false);
      setEditingCat(null);
      setCatForm({ name: "" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const result = await addClient(
        clientForm.name, 
        clientForm.phone, 
        clientForm.startDate, 
        clientForm.duration
      );
      if (result) {
        setIsClientModalOpen(false);
        setClientForm({ 
          name: "", 
          phone: "", 
          startDate: new Date().toISOString().split('T')[0], 
          duration: 1 
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const openEditPack = (pack: any) => {
    setEditingPack(pack);
    setPackForm({ 
      title: pack.title, 
      mockupUrls: pack.mockupUrls || [], 
      downloadUrl: pack.downloadUrl, 
      categoryId: pack.categoryId,
      duration: pack.duration || 3
    });
    setIsPackModalOpen(true);
  };

  const openEditCat = (cat: any) => {
    setEditingCat(cat);
    setCatForm({ name: cat.name });
    setIsCatModalOpen(true);
  };

  const handleSavePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingPromotion) {
        await updatePromotion(editingPromotion.id, promotionForm);
      } else {
        if (promotions.length >= 5) {
          alert("Limite de 5 anúncios atingido!");
          setIsSaving(false);
          return;
        }
        await addPromotion(promotionForm);
      }
      setIsPromotionModalOpen(false);
      setEditingPromotion(null);
      setPromotionForm({ title: "", price: "", imageUrl: "", link: "", position: "left" });
    } finally {
      setIsSaving(false);
    }
  };

  const openEditPromotion = (promo: any) => {
    setEditingPromotion(promo);
    setPromotionForm({ 
      title: promo.title, 
      price: promo.price, 
      imageUrl: promo.imageUrl, 
      link: promo.link,
      position: promo.position || "left"
    });
    setIsPromotionModalOpen(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const publicUrl = await uploadMockup(file);
      await updateSiteSettings({ logoUrl: publicUrl });
    } catch (error: any) {
      alert("Erro no upload: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSiteSettings({ whatsappLink: whatsappForm });
      alert("Link do WhatsApp salvo com sucesso!");
    } catch (error: any) {
      alert("Erro ao salvar link: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔑 handleChangePassword chamado');
    console.log('🔐 passwordForm:', passwordForm);
    console.log('⚙️ siteSettings:', siteSettings);
    const currentAdminPassword = siteSettings?.adminPassword || "admin";
    console.log('🆚 Comparando - Senha digitada:', passwordForm.current, '| Senha atual:', currentAdminPassword);
    
    if (passwordForm.current !== currentAdminPassword) {
      alert("Senha atual incorreta!");
      return;
    }
    
    if (passwordForm.new !== passwordForm.confirm) {
      alert("As senhas novas não coincidem!");
      return;
    }
    
    if (passwordForm.new.length < 3) {
      alert("A nova senha deve ter pelo menos 3 caracteres!");
      return;
    }
    
    setIsSaving(true);
    try {
      console.log('📤 Enviando nova senha para updateSiteSettings:', passwordForm.new);
      await updateSiteSettings({ adminPassword: passwordForm.new });
      alert("Senha alterada com sucesso!");
      setPasswordForm({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      console.error('❌ Erro ao alterar senha:', error);
      alert("Erro ao alterar senha: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-30 h-full bg-indigo-900 text-white
        w-72 md:w-64 flex-shrink-0 overflow-y-auto
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 sm:p-6 flex items-center justify-between md:justify-start">
          <h2 className="text-lg sm:text-xl font-bold">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 text-white hover:bg-indigo-800 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="mt-4 flex flex-col h-[calc(100vh-100px)]">
          <button
            onClick={() => {
              setActiveTab("packs");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 transition-colors text-sm ${
              activeTab === "packs" ? "bg-indigo-800 border-l-4 border-white" : "hover:bg-indigo-800"
            }`}
          >
            <ImageIcon size={20} />
            <span className="hidden sm:inline">Gerenciar Packs</span>
            <span className="sm:hidden">Packs</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("categories");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 transition-colors text-sm ${
              activeTab === "categories" ? "bg-indigo-800 border-l-4 border-white" : "hover:bg-indigo-800"
            }`}
          >
            <Layout size={20} />
            <span className="hidden sm:inline">Categorias</span>
            <span className="sm:hidden">Categ</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("clients");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 transition-colors text-sm ${
              activeTab === "clients" ? "bg-indigo-800 border-l-4 border-white" : "hover:bg-indigo-800"
            }`}
          >
            <Users size={20} />
            <span className="hidden sm:inline">Gerenciar Clientes</span>
            <span className="sm:hidden">Clientes</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("promotions");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 transition-colors text-sm ${
              activeTab === "promotions" ? "bg-indigo-800 border-l-4 border-white" : "hover:bg-indigo-800"
            }`}
          >
            <Tag size={20} />
            <span className="hidden sm:inline">Promoções</span>
            <span className="sm:hidden">Promos</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("sections");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 transition-colors text-sm ${
              activeTab === "sections" ? "bg-indigo-800 border-l-4 border-white" : "hover:bg-indigo-800"
            }`}
          >
            <Layout size={20} />
            <span className="hidden sm:inline">Seções</span>
            <span className="sm:hidden">Seções</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("settings");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 transition-colors text-sm ${
              activeTab === "settings" ? "bg-indigo-800 border-l-4 border-white" : "hover:bg-indigo-800"
            }`}
          >
            <Settings size={20} />
            <span className="hidden sm:inline">Configurações</span>
            <span className="sm:hidden">Config</span>
          </button>
          
          <div className="mt-auto mb-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 text-red-300 hover:bg-red-900/50 hover:text-white transition-colors text-sm"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Sair do Painel</span>
              <span className="sm:hidden">Sair</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 p-2 bg-indigo-600 text-white rounded-lg"
        >
          <Layout size={24} />
        </button>
        
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {activeTab === "packs" ? "Gerenciar Packs de Artes" : 
             activeTab === "categories" ? "Gerenciar Categorias" : 
             activeTab === "clients" ? "Gerenciar Clientes" :
             activeTab === "promotions" ? "Gerenciar Promoções" :
             activeTab === "sections" ? "Gerenciar Seções" : "Configurações do Site"}
          </h1>
          <div className="flex gap-3 w-full sm:w-auto">
            {activeTab === "clients" && (
              <div className="relative flex-1 sm:flex-none sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
                />
              </div>
            )}
            {(activeTab === "packs" || activeTab === "categories" || activeTab === "clients" || activeTab === "promotions" || activeTab === "sections") && (
              <button
                onClick={() => {
                  if (activeTab === "packs") setIsPackModalOpen(true);
                  else if (activeTab === "categories") setIsCatModalOpen(true);
                  else if (activeTab === "clients") setIsClientModalOpen(true);
                  else if (activeTab === "promotions") setIsPromotionModalOpen(true);
                  else {
                    setEditingSection(null);
                    setSectionForm({ name: "", icon: "" });
                    setIsSectionModalOpen(true);
                  }
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                <Plus size={20} />
                Adicionar {activeTab === "packs" ? "Pack" : activeTab === "categories" ? "Categoria" : activeTab === "clients" ? "Cliente" : activeTab === "promotions" ? "Promoção" : "Seção"}
              </button>
            )}
          </div>
        </div>

        {activeTab === "packs" ? (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Mockup</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Título</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Categoria</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-black">
                  {artPacks.map((pack) => (
                    <tr key={pack.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <img src={pack.mockupUrls[0]} alt="" className="w-12 h-12 rounded object-cover" />
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{pack.title}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {categories.find(c => c.id === pack.categoryId)?.name || "---"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditPack(pack)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={18} /></button>
                          <button onClick={() => deleteArtPack(pack.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {artPacks.map((pack) => (
                <div key={pack.id} className="bg-white p-4 rounded-xl shadow-sm border">
                  <div className="flex gap-4">
                    <img src={pack.mockupUrls[0]} alt="" className="w-20 h-20 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{pack.title}</h3>
                      <p className="text-sm text-gray-600">
                        {categories.find(c => c.id === pack.categoryId)?.name || "---"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <button onClick={() => openEditPack(pack)} className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded flex items-center justify-center gap-1">
                      <Edit2 size={16} /> Editar
                    </button>
                    <button onClick={() => deleteArtPack(pack.id)} className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded flex items-center justify-center gap-1">
                      <Trash2 size={16} /> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "categories" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
                <span className="font-medium text-gray-900">{cat.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => openEditCat(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                  <button onClick={() => deleteCategory(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "clients" ? (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Cliente</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Vencimento</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Token</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-black">
                  {clients.map((client) => {
                    const isExpired = client.endDate ? new Date(client.endDate) < new Date() : false;
                    const matchesSearch = 
                      client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (client.phone && client.phone.includes(searchTerm));
                    
                    if (!matchesSearch) return null;
                    
                    return (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{client.name}</div>
                          <div className="text-xs text-gray-500">{client.phone || "Sem telefone"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isExpired 
                              ? "bg-red-100 text-red-700" 
                              : client.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                          }`}>
                            {isExpired ? "Expirado" : client.active ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {client.endDate ? new Date(client.endDate).toLocaleDateString('pt-BR') : "---"}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">{client.token}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => renewSubscription(client.id, 1)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                              title="Renovar 1 mês"
                            >
                              <RefreshCw size={18} />
                            </button>
                            <button 
                              onClick={() => copyToClipboard(client.token, client.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="Copiar Token"
                            >
                              {copiedId === client.id ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                            </button>
                            <button 
                              onClick={() => toggleClientStatus(client.id)}
                              className={`p-2 rounded ${client.active ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
                              title={client.active ? "Desativar" : "Ativar"}
                            >
                              {client.active ? <PowerOff size={18} /> : <Power size={18} />}
                            </button>
                            <button 
                              onClick={() => deleteClient(client.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {clients.map((client) => {
                const isExpired = client.endDate ? new Date(client.endDate) < new Date() : false;
                const matchesSearch = 
                  client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  (client.phone && client.phone.includes(searchTerm));
                
                if (!matchesSearch) return null;
                
                return (
                  <div key={client.id} className="bg-white p-4 rounded-xl shadow-sm border">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{client.name}</h3>
                        <p className="text-sm text-gray-600">{client.phone || "Sem telefone"}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isExpired 
                          ? "bg-red-100 text-red-700" 
                          : client.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {isExpired ? "Expirado" : client.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Vencimento:</span>
                        <span className="text-sm font-medium">{client.endDate ? new Date(client.endDate).toLocaleDateString('pt-BR') : "---"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Token:</span>
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{client.token}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 pt-3 border-t">
                      <button 
                        onClick={() => renewSubscription(client.id, 1)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded flex items-center justify-center"
                        title="Renovar 1 mês"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button 
                        onClick={() => copyToClipboard(client.token, client.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded flex items-center justify-center"
                        title="Copiar Token"
                      >
                        {copiedId === client.id ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                      </button>
                      <button 
                        onClick={() => toggleClientStatus(client.id)}
                        className={`p-2 rounded flex items-center justify-center ${client.active ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
                        title={client.active ? "Desativar" : "Ativar"}
                      >
                        {client.active ? <PowerOff size={16} /> : <Power size={16} />}
                      </button>
                      <button 
                        onClick={() => deleteClient(client.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded flex items-center justify-center"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === "promotions" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotions.map((promo) => (
              <div key={promo.id} className="bg-white p-3 rounded-xl shadow-sm border">
                <img src={promo.imageUrl} alt={promo.title} className="w-full h-16 object-cover rounded-lg mb-2" />
                <h3 className="font-bold text-gray-900 mb-1 text-sm">{promo.title}</h3>
                <p className="text-sm font-semibold text-indigo-600 mb-2">{promo.price}</p>
                <div className="flex gap-2">
                  <button onClick={() => openEditPromotion(promo)} className="flex-1 p-1.5 text-blue-600 hover:bg-blue-50 rounded flex items-center justify-center gap-1 text-xs"><Edit2 size={14} /> Editar</button>
                  <button onClick={() => deletePromotion(promo.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "sections" ? (
          <div className="space-y-6">
            {/* Seções customizadas */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Seções do Site</h2>
              <div className="grid grid-cols-1 gap-6">
                {customSections.map((section) => (
                  <div key={section.id} className="p-4 rounded-xl border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{section.icon}</span>
                        <h3 className="font-bold text-gray-900 text-lg">{section.name}</h3>
                        <span className="text-sm text-gray-500">({section.items?.length || 0} itens)</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setCurrentSectionForItems(section.id);
                            setEditingItem(null);
                            setItemForm({ title: "", description: "", imageUrl: "", link: "" });
                            setIsItemModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          <Plus size={14} /> Adicionar Item
                        </button>
                        <button
                          onClick={() => {
                            setEditingSection(section);
                            setSectionForm({ name: section.name, icon: section.icon });
                            setIsSectionModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Tem certeza que quer excluir esta seção?")) {
                              deleteCustomSection(section.id);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Excluir seção"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Lista de itens da seção */}
                    {section.items && section.items.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {section.items.map((item: any) => (
                          <div key={item.id} className="p-3 rounded-lg border bg-gray-50">
                            {item.image_url && (
                              <img 
                                src={item.image_url} 
                                alt={item.title} 
                                className="w-full h-24 object-cover rounded mb-2"
                              />
                            )}
                            <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                            )}
                            <div className="flex gap-1 mt-2">
                              <button
                                onClick={() => {
                                  setCurrentSectionForItems(section.id);
                                  setEditingItem(item);
                                  setItemForm({ 
                                    title: item.title, 
                                    description: item.description, 
                                    imageUrl: item.image_url, 
                                    link: item.link 
                                  });
                                  setIsItemModalOpen(true);
                                }}
                                className="flex-1 p-1.5 text-blue-600 hover:bg-blue-50 rounded text-xs"
                              >
                                <Edit2 size={12} /> Editar
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Excluir este item?")) {
                                    deleteSectionItem(item.id, section.id);
                                  }
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Nenhum item nesta seção ainda.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Logo do Site</h2>
              <div className="flex items-center gap-6">
                {siteSettings?.logoUrl && (
                  <img src={siteSettings.logoUrl} alt="Logo" className="h-20 object-contain" />
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="text-sm text-gray-500 mt-2">Faça upload da logo do seu site</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Link do WhatsApp (Ajuda)</h2>
              <form onSubmit={handleSaveWhatsapp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Link do WhatsApp</label>
                  <input
                    type="text"
                    value={whatsappForm || siteSettings?.whatsappLink || ""}
                    onChange={(e) => setWhatsappForm(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://wa.me/5511999999999"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                >
                  {isSaving ? "Salvando..." : "Salvar Link"}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Alterar Senha do Admin</h2>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Senha Atual</label>
                  <input
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                  <input
                    type="password"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                >
                  {isSaving ? "Alterando..." : "Alterar Senha"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Pack Modal */}
      {isPackModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 text-black">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingPack ? "Editar Pack" : "Novo Pack de Arte"}</h2>
              <button onClick={() => setIsPackModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <form onSubmit={handleSavePack} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input
                  required
                  value={packForm.title}
                  onChange={e => setPackForm({...packForm, title: e.target.value})}
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mockups (Carrossel - Max 10)</label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {packForm.mockupUrls.map((url, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img src={url} className="w-full h-full object-cover rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => setPackForm({...packForm, mockupUrls: packForm.mockupUrls.filter((_, idx) => idx !== i)})}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {packForm.mockupUrls.length < 10 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
                    >
                      <Plus size={20} />
                      <span className="text-[10px] mt-1">{isUploading ? "..." : "Add"}</span>
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tempo de Transição (segundos)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  required
                  value={packForm.duration}
                  onChange={e => setPackForm({...packForm, duration: parseInt(e.target.value)})}
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">URL do Download (Google Drive)</label>
                <input
                  required
                  value={packForm.downloadUrl}
                  onChange={e => setPackForm({...packForm, downloadUrl: e.target.value})}
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Categoria</label>
                <select
                  required
                  value={packForm.categoryId}
                  onChange={e => setPackForm({...packForm, categoryId: e.target.value})}
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
              >
                {isSaving ? "Salvando..." : editingPack ? "Atualizar Pack" : "Salvar Pack"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 text-black">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingCat ? "Editar Categoria" : "Nova Categoria"}</h2>
              <button onClick={() => setIsCatModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <form onSubmit={handleSaveCat} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome da Categoria</label>
                <input
                  required
                  value={catForm.name}
                  onChange={e => setCatForm({name: e.target.value})}
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {isSaving ? "Salvando..." : editingCat ? "Salvar Alterações" : "Adicionar Categoria"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 text-black">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingSection ? "Editar Seção" : "Nova Seção"}</h2>
              <button onClick={() => setIsSectionModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (editingSection) {
                  await updateCustomSection(editingSection.id, { name: sectionForm.name, icon: sectionForm.icon });
                } else {
                  await addCustomSection({ name: sectionForm.name, icon: sectionForm.icon || "📁" });
                }
                setIsSectionModalOpen(false);
                setEditingSection(null);
                setSectionForm({ name: "", icon: "" });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome da Seção</label>
                <input
                  required
                  value={sectionForm.name}
                  onChange={e => setSectionForm({ ...sectionForm, name: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Novidades, Ofertas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ícone (emoji)</label>
                <input
                  value={sectionForm.icon}
                  onChange={e => setSectionForm({ ...sectionForm, icon: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: ⭐, 🎉, 🔥"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                {editingSection ? "Atualizar Seção" : "Adicionar Seção"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {isItemModalOpen && currentSectionForItems && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 text-black">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingItem ? "Editar Item" : "Novo Item"}</h2>
              <button onClick={() => setIsItemModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (editingItem) {
                  await updateSectionItem(editingItem.id, {
                    title: itemForm.title,
                    description: itemForm.description,
                    image_url: itemForm.imageUrl,
                    link: itemForm.link
                  });
                } else if (currentSectionForItems) {
                  await addSectionItem({
                    section_id: currentSectionForItems,
                    title: itemForm.title,
                    description: itemForm.description,
                    image_url: itemForm.imageUrl,
                    link: itemForm.link
                  });
                }
                setIsItemModalOpen(false);
                setEditingItem(null);
                setCurrentSectionForItems(null);
                setItemForm({ title: "", description: "", imageUrl: "", link: "" });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Título do Item</label>
                <input
                  required
                  value={itemForm.title}
                  onChange={e => setItemForm({ ...itemForm, title: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Serviço de Design"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  value={itemForm.description}
                  onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Breve descrição..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">URL da Imagem</label>
                <input
                  value={itemForm.imageUrl}
                  onChange={e => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Link (opcional)</label>
                <input
                  value={itemForm.link}
                  onChange={e => setItemForm({ ...itemForm, link: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://exemplo.com/saiba-mais"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                {editingItem ? "Atualizar Item" : "Adicionar Item"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 text-black">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl relative animate-in zoom-in duration-200">
            <button 
              onClick={() => setIsClientModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Users className="text-indigo-600" />
              Novo Cliente
            </h2>
            <form onSubmit={handleSaveClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Phone size={16} /> WhatsApp / Telefone
                </label>
                <input
                  type="text"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Calendar size={16} /> Data de Início
                </label>
                <input
                  type="date"
                  required
                  value={clientForm.startDate}
                  onChange={(e) => setClientForm({ ...clientForm, startDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duração do Plano</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setClientForm({ ...clientForm, duration: 1 })}
                    className={`py-2 px-4 rounded-lg border font-medium transition-all ${
                      clientForm.duration === 1 
                        ? "bg-indigo-600 text-white border-indigo-600" 
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    1 Mês
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientForm({ ...clientForm, duration: 12 })}
                    className={`py-2 px-4 rounded-lg border font-medium transition-all ${
                      clientForm.duration === 12 
                        ? "bg-indigo-600 text-white border-indigo-600" 
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    1 Ano
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                Vencimento previsto: <span className="font-bold">
                  {(() => {
                    const start = new Date(clientForm.startDate);
                    const end = new Date(clientForm.startDate);
                    end.setMonth(start.getMonth() + clientForm.duration);
                    return end.toLocaleDateString('pt-BR');
                  })()}
                </span>
              </p>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
              >
                {isSaving ? "Salvando..." : "Criar Cliente e Gerar Link"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      {isPromotionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 text-black">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingPromotion ? "Editar Promoção" : "Nova Promoção"}</h2>
              <button onClick={() => setIsPromotionModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <form onSubmit={handleSavePromotion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input
                  required
                  value={promotionForm.title}
                  onChange={e => setPromotionForm({...promotionForm, title: e.target.value})}
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Preço</label>
                <input
                  required
                  value={promotionForm.price}
                  onChange={e => setPromotionForm({...promotionForm, price: e.target.value})}
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: R$ 99,90"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">URL da Imagem</label>
                <input
                  required
                  value={promotionForm.imageUrl}
                  onChange={e => setPromotionForm({...promotionForm, imageUrl: e.target.value})}
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Link</label>
                <input
                  required
                  value={promotionForm.link}
                  onChange={e => setPromotionForm({...promotionForm, link: e.target.value})}
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Posição na Galeria</label>
                <select
                  value={promotionForm.position}
                  onChange={e => setPromotionForm({...promotionForm, position: e.target.value as "left" | "right"})}
                  className="w-full mt-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="left">Lado Esquerdo</option>
                  <option value="right">Lado Direito</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
              >
                {isSaving ? "Salvando..." : editingPromotion ? "Atualizar Promoção" : "Salvar Promoção"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
