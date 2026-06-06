"use client";

export const dynamic = "force-dynamic";

import { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { Plus, Edit2, Trash2, Layout, Image as ImageIcon, ExternalLink, X, LogOut, Upload, Users, Copy, Check, Power, PowerOff, Calendar, Phone, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { 
    categories, addCategory, updateCategory, deleteCategory,
    artPacks, addArtPack, updateArtPack, deleteArtPack,
    clients, addClient, deleteClient, toggleClientStatus, renewSubscription,
    uploadMockup,
    isLoaded 
  } = useStore();

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"packs" | "categories" | "clients">("packs");
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<any>(null);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="mt-4 flex flex-col h-[calc(100vh-100px)]">
          <button
            onClick={() => setActiveTab("packs")}
            className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
              activeTab === "packs" ? "bg-indigo-800 border-l-4 border-white" : "hover:bg-indigo-800"
            }`}
          >
            <ImageIcon size={20} />
            Gerenciar Packs
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
              activeTab === "categories" ? "bg-indigo-800 border-l-4 border-white" : "hover:bg-indigo-800"
            }`}
          >
            <Layout size={20} />
            Categorias
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
              activeTab === "clients" ? "bg-indigo-800 border-l-4 border-white" : "hover:bg-indigo-800"
            }`}
          >
            <Users size={20} />
            Gerenciar Clientes
          </button>
          
          <div className="mt-auto mb-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-4 text-red-300 hover:bg-red-900/50 hover:text-white transition-colors"
            >
              <LogOut size={20} />
              Sair do Painel
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === "packs" ? "Gerenciar Packs de Artes" : activeTab === "categories" ? "Gerenciar Categorias" : "Gerenciar Clientes"}
          </h1>
          <button
            onClick={() => {
              if (activeTab === "packs") setIsPackModalOpen(true);
              else if (activeTab === "categories") setIsCatModalOpen(true);
              else setIsClientModalOpen(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
            Adicionar {activeTab === "packs" ? "Pack" : activeTab === "categories" ? "Categoria" : "Cliente"}
          </button>
        </div>

        {activeTab === "packs" ? (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
    </div>
  );
}
