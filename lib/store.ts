"use client";

import { useState, useEffect } from 'react';
import { Category, ArtPack, Client } from './data';
import { supabase } from './supabase';

export function useStore() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [artPacks, setArtPacks] = useState<ArtPack[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      const { data: packs } = await supabase.from('art_packs').select('*').order('created_at', { ascending: false });
      const { data: cls } = await supabase.from('clients').select('*').order('created_at', { ascending: false });

      if (cats) setCategories(cats);
      if (packs) {
        // Mapeia os nomes do banco (snake_case) para o código (camelCase)
        const mappedPacks = packs.map((p: any) => ({
          id: p.id,
          title: p.title,
          mockupUrls: p.mockup_urls,
          downloadUrl: p.download_url,
          categoryId: p.category_id,
          duration: p.duration
        }));
        setArtPacks(mappedPacks);
      }
      if (cls) setClients(cls);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  // Category CRUD
  const addCategory = async (name: string) => {
    const { data, error } = await supabase.from('categories').insert([{ name }]).select();
    if (data) setCategories([...categories, data[0]]);
  };

  const updateCategory = async (id: string, name: string) => {
    const { error } = await supabase.from('categories').update({ name }).eq('id', id);
    if (!error) setCategories(categories.map(c => c.id === id ? { ...c, name } : c));
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) {
      setCategories(categories.filter(c => c.id !== id));
      setArtPacks(artPacks.filter(p => p.categoryId !== id));
    }
  };

  // Art Pack CRUD
  const addArtPack = async (pack: Omit<ArtPack, 'id'>) => {
    const { data, error } = await supabase.from('art_packs').insert([{
      title: pack.title,
      mockup_urls: pack.mockupUrls,
      download_url: pack.downloadUrl,
      category_id: pack.categoryId,
      duration: pack.duration
    }]).select();
    
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
    if (pack.title) updateData.title = pack.title;
    if (pack.mockupUrls) updateData.mockup_urls = pack.mockupUrls;
    if (pack.downloadUrl) updateData.download_url = pack.downloadUrl;
    if (pack.categoryId) updateData.category_id = pack.categoryId;
    if (pack.duration) updateData.duration = pack.duration;

    const { error } = await supabase.from('art_packs').update(updateData).eq('id', id);
    if (!error) setArtPacks(artPacks.map(p => p.id === id ? { ...p, ...pack } : p));
  };

  const deleteArtPack = async (id: string) => {
    const { error } = await supabase.from('art_packs').delete().eq('id', id);
    if (!error) setArtPacks(artPacks.filter(p => p.id !== id));
  };

  // Client CRUD
  const addClient = async (name: string) => {
    try {
      const token = Math.random().toString(36).substring(2, 10).toUpperCase();
      console.log('Tentando adicionar cliente:', { name, token });
      
      const { data, error } = await supabase
        .from('clients')
        .insert([{ name, token, active: true }])
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
    if (!error) setClients(clients.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (!error) setClients(clients.filter(c => c.id !== id));
  };

  const toggleClientStatus = async (id: string) => {
    const client = clients.find(c => c.id === id);
    if (client) {
      const { error } = await supabase.from('clients').update({ active: !client.active }).eq('id', id);
      if (!error) setClients(clients.map(c => c.id === id ? { ...c, active: !client.active } : c));
    }
  };

  return {
    categories,
    artPacks,
    isLoaded,
    addCategory,
    updateCategory,
    deleteCategory,
    addArtPack,
    updateArtPack,
    deleteArtPack,
    clients,
    addClient,
    updateClient,
    deleteClient,
    toggleClientStatus
  };
}
