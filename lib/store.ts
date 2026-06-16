"use client";

import { useState, useEffect } from 'react';
import { Category, ArtPack, Client, Promotion, SiteSettings } from './data';
import { supabase } from './supabase';

export function useStore() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [artPacks, setArtPacks] = useState<ArtPack[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log('🔍 Buscando dados do Supabase...');
    try {
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      const { data: packs } = await supabase.from('art_packs').select('*').order('created_at', { ascending: false });
      const { data: cls } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
      const { data: promos } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
      const { data: settings, error: settingsError } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();

      if (settingsError) {
        console.error('❌ Erro ao buscar site_settings:', settingsError);
      }
      console.log('⚙️ Configurações carregadas:', settings);

      if (cats) setCategories(cats);
      if (packs) {
        const mappedPacks = packs.map((p) => ({
          id: p.id,
          title: p.title,
          mockupUrls: p.mockup_urls,
          downloadUrl: p.download_url,
          categoryId: p.category_id,
          duration: p.duration
        }));
        setArtPacks(mappedPacks);
      }
      if (cls) {
        const mappedClients = cls.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          token: c.token,
          active: c.active,
          startDate: c.start_date,
          endDate: c.end_date,
          createdAt: c.created_at
        }));
        setClients(mappedClients);
      }
      if (promos) {
        const mappedPromos = promos.map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          imageUrl: p.image_url,
          link: p.link,
          position: p.position || "left"
        }));
        setPromotions(mappedPromos);
      }
      if (settings) {
        setSiteSettings({
          id: settings.id,
          logoUrl: settings.logo_url,
          whatsappLink: settings.whatsapp_link,
          adminPassword: settings.admin_password
        });
        console.log('✅ siteSettings definido:', {
          id: settings.id,
          logoUrl: settings.logo_url,
          whatsappLink: settings.whatsapp_link
        });
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const addCategory = async (name: string) => {
    const { data, error } = await supabase.from('categories').insert([{ name }]).select();
    if (error) console.error('Erro ao adicionar categoria:', error);
    if (data) setCategories([...categories, data[0]]);
  };

  const updateCategory = async (id: string, name: string) => {
    const { error } = await supabase.from('categories').update({ name }).eq('id', id);
    if (error) console.error('Erro ao atualizar categoria:', error);
    if (!error) setCategories(categories.map(c => c.id === id ? { ...c, name } : c));
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) console.error('Erro ao deletar categoria:', error);
    if (!error) {
      setCategories(categories.filter(c => c.id !== id));
      setArtPacks(artPacks.filter(p => p.categoryId !== id));
    }
  };

  const addArtPack = async (pack: Omit<ArtPack, 'id'>) => {
    const { data, error } = await supabase.from('art_packs').insert([{
      title: pack.title,
      mockup_urls: pack.mockupUrls,
      download_url: pack.downloadUrl,
      category_id: pack.categoryId,
      duration: pack.duration
    }]).select();
    
    if (error) console.error('Erro ao adicionar pack:', error);
    if (data) {
      const newPack = {
        id: data[0].id,
        title: data[0].title,
        mockupUrls: data[0].mockup_urls,
        downloadUrl: data[0].download_url,
        categoryId: data[0].category_id,
        duration: data[0].duration
      };
      setArtPacks([newPack, ...artPacks]);
    }
  };

  const updateArtPack = async (id: string, pack: Partial<ArtPack>) => {
    const updateData: any = {};
    if (pack.title !== undefined) updateData.title = pack.title;
    if (pack.mockupUrls !== undefined) updateData.mockup_urls = pack.mockupUrls;
    if (pack.downloadUrl !== undefined) updateData.download_url = pack.downloadUrl;
    if (pack.categoryId !== undefined) updateData.category_id = pack.categoryId;
    if (pack.duration !== undefined) updateData.duration = pack.duration;

    const { error } = await supabase.from('art_packs').update(updateData).eq('id', id);
    if (error) console.error('Erro ao atualizar pack:', error);
    if (!error) setArtPacks(artPacks.map(p => p.id === id ? { ...p, ...pack } : p));
  };

  const deleteArtPack = async (id: string) => {
    const { error } = await supabase.from('art_packs').delete().eq('id', id);
    if (error) console.error('Erro ao deletar pack:', error);
    if (!error) setArtPacks(artPacks.filter(p => p.id !== id));
  };

  const addClient = async (name: string, phone: string, startDate: string, durationMonths: number) => {
    try {
      const token = Math.random().toString(36).substring(2, 10).toUpperCase();
      const start = new Date(startDate);
      const end = new Date(startDate);
      end.setMonth(start.getMonth() + durationMonths);
      
      const { data, error } = await supabase
        .from('clients')
        .insert([{ 
          name, 
          phone,
          token, 
          active: true,
          start_date: startDate,
          end_date: end.toISOString()
        }])
        .select();
      
      if (error) {
        console.error('Erro detalhado do Supabase:', error);
        alert('Erro ao salvar no banco de dados: ' + error.message);
        return;
      }

      if (data) {
        console.log('Cliente adicionado com sucesso:', data[0]);
        setClients(prev => [data[0], ...prev]);
        return data[0];
      }
    } catch (err) {
      console.error('Erro na função addClient:', err);
      alert('Erro inesperado ao salvar cliente.');
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const { error } = await supabase.from('clients').update(updates).eq('id', id);
    if (error) console.error('Erro ao atualizar cliente:', error);
    if (!error) setClients(clients.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) console.error('Erro ao deletar cliente:', error);
    if (!error) setClients(clients.filter(c => c.id !== id));
  };

  const toggleClientStatus = async (id: string) => {
    const client = clients.find(c => c.id === id);
    if (client) {
      const { error } = await supabase.from('clients').update({ active: !client.active }).eq('id', id);
      if (error) console.error('Erro ao trocar status do cliente:', error);
      if (!error) setClients(clients.map(c => c.id === id ? { ...c, active: !client.active } : c));
    }
  };

  const renewSubscription = async (id: string, months: number) => {
    try {
      const client = clients.find(c => c.id === id);
      if (!client) return;

      const currentEnd = client.endDate ? new Date(client.endDate) : new Date();
      const newEnd = new Date(currentEnd > new Date() ? currentEnd : new Date());
      newEnd.setMonth(newEnd.getMonth() + months);

      const { error } = await supabase
        .from('clients')
        .update({ 
          end_date: newEnd.toISOString(),
          active: true 
        })
        .eq('id', id);

      if (error) console.error('Erro ao renovar assinatura:', error);
      if (!error) {
        setClients(clients.map(c => c.id === id ? { ...c, endDate: newEnd.toISOString(), active: true } : c));
      }
    } catch (error) {
      console.error('Erro ao renovar assinatura:', error);
    }
  };

  const addPromotion = async (promotion: Omit<Promotion, 'id'>) => {
    try {
      console.log('Adding promotion:', promotion);
      const { data, error } = await supabase.from('promotions').insert([{
        title: promotion.title,
        price: promotion.price,
        image_url: promotion.imageUrl,
        link: promotion.link,
        position: promotion.position
      }]).select();

      if (error) {
        console.error('Supabase error adding promotion:', error);
        alert('Erro ao adicionar promoção: ' + error.message);
        return;
      }

      if (data && data.length > 0) {
        const newPromo = {
          id: data[0].id,
          title: data[0].title,
          price: data[0].price,
          imageUrl: data[0].image_url,
          link: data[0].link,
          position: data[0].position || "left"
        };
        setPromotions([newPromo, ...promotions]);
        console.log('Promotion added:', newPromo);
      }
    } catch (err) {
      console.error('Error in addPromotion:', err);
      alert('Erro inesperado ao adicionar promoção.');
    }
  };

  const updatePromotion = async (id: string, promotion: Partial<Promotion>) => {
    const updateData: any = {};
    if (promotion.title !== undefined) updateData.title = promotion.title;
    if (promotion.price !== undefined) updateData.price = promotion.price;
    if (promotion.imageUrl !== undefined) updateData.image_url = promotion.imageUrl;
    if (promotion.link !== undefined) updateData.link = promotion.link;
    if (promotion.position !== undefined) updateData.position = promotion.position;

    const { error } = await supabase.from('promotions').update(updateData).eq('id', id);
    if (error) console.error('Erro ao atualizar promoção:', error);
    if (!error) setPromotions(promotions.map(p => p.id === id ? { ...p, ...promotion } : p));
  };

  const deletePromotion = async (id: string) => {
    const { error } = await supabase.from('promotions').delete().eq('id', id);
    if (error) console.error('Erro ao deletar promoção:', error);
    if (!error) setPromotions(promotions.filter(p => p.id !== id));
  };

  const updateSiteSettings = async (updates: Partial<SiteSettings>) => {
    console.log('🔧 Atualizando configurações do site:', updates);
    const updateData: any = {};
    if (updates.logoUrl !== undefined) updateData.logo_url = updates.logoUrl;
    if (updates.whatsappLink !== undefined) updateData.whatsapp_link = updates.whatsappLink;
    if (updates.adminPassword !== undefined) updateData.admin_password = updates.adminPassword;

    console.log('📝 Dados para atualizar:', updateData);
    const { data: existing, error: fetchError } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
    console.log('📋 Configurações existentes:', existing);
    if (fetchError) {
      console.error('❌ Erro ao buscar configurações:', fetchError);
      alert('Erro ao buscar configurações: ' + fetchError.message);
      return;
    }
    
    if (existing) {
      console.log('✏️ Atualizando configurações existentes...');
      const { error } = await supabase.from('site_settings').update(updateData).eq('id', existing.id);
      if (error) {
        console.error('❌ Erro ao atualizar configurações:', error);
        alert('Erro ao atualizar configurações: ' + error.message);
        return;
      }
      console.log('✅ Configurações atualizadas com sucesso!');
      if (!error && siteSettings) {
        setSiteSettings({ ...siteSettings, ...updates });
      }
    } else {
      console.log('🆕 Criando novas configurações...');
      const { data, error } = await supabase.from('site_settings').insert([updateData]).select();
      if (error) {
        console.error('❌ Erro ao criar configurações:', error);
        alert('Erro ao criar configurações: ' + error.message);
        return;
      }
      console.log('✅ Configurações criadas com sucesso!', data);
      if (data) {
        setSiteSettings({
          id: data[0].id,
          logoUrl: data[0].logo_url || "",
          whatsappLink: data[0].whatsapp_link || "",
          adminPassword: data[0].admin_password || "admin"
        });
      }
    }
  };

  const fetchCurrentClient = async (token: string) => {
    console.log('🔍 fetchCurrentClient chamado com token:', token);
    if (token === "admin" || !token) {
      console.log('⚠️ Token é admin ou vazio, setando currentClient para null');
      setCurrentClient(null);
      return;
    }
    try {
      console.log('📡 Buscando cliente no Supabase...');
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("token", token)
        .single();
      
      if (error) {
        console.error('❌ Erro ao buscar cliente atual no Supabase:', error);
        alert('Erro ao carregar dados do cliente: ' + error.message);
        setCurrentClient(null);
        return;
      }
      
      console.log('✅ Cliente encontrado:', data);
      if (data) {
        const clientData = {
          id: data.id,
          name: data.name,
          phone: data.phone,
          token: data.token,
          active: data.active,
          startDate: data.start_date,
          endDate: data.end_date,
          createdAt: data.created_at
        };
        console.log('📋 Dados mapeados do cliente:', clientData);
        setCurrentClient(clientData);
      }
    } catch (err) {
      console.error('❌ Erro na função fetchCurrentClient:', err);
      alert('Erro inesperado ao carregar cliente');
    }
  };

  return {
    categories,
    artPacks,
    clients,
    promotions,
    siteSettings,
    currentClient,
    isLoaded,
    addCategory,
    updateCategory,
    deleteCategory,
    addArtPack,
    updateArtPack,
    deleteArtPack,
    addClient,
    updateClient,
    deleteClient,
    toggleClientStatus,
    uploadMockup,
    renewSubscription,
    addPromotion,
    updatePromotion,
    deletePromotion,
    updateSiteSettings,
    fetchCurrentClient
  };
}

async function uploadMockup(file: File) {
  console.log('📤 Iniciando upload do arquivo:', file.name);
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log('📁 Caminho do arquivo:', filePath);
    const { data, error } = await supabase.storage
      .from('mockups')
      .upload(filePath, file);

    if (error) {
      console.error('❌ Erro no upload:', error);
      throw error;
    }
    console.log('✅ Upload concluído:', data);

    const { data: { publicUrl } } = supabase.storage
      .from('mockups')
      .getPublicUrl(filePath);
    console.log('🔗 URL pública:', publicUrl);

    return publicUrl;
  } catch (error: any) {
    console.error('Erro no upload para o Supabase:', error.message);
    throw error;
  }
}
