"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { siteSettings, isLoaded } = useStore();

  useEffect(() => {
    // Se o cliente acessou via link (ex: ?token=ABC123)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    }
  }, []);

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const adminPassword = siteSettings?.adminPassword || "admin";
      if (token === adminPassword) {
        localStorage.setItem("auth_token", "admin");
        router.push("/admin");
        return;
      }

      // Valida o token no Supabase
      const { data: client, error: sbError } = await supabase
        .from("clients")
        .select("*")
        .eq("token", token)
        .single();

      if (sbError || !client) {
        // Fallback para token fixo antigo se necessário (opcional)
        if (token === "art2024") {
          localStorage.setItem("auth_token", token);
          router.push("/gallery");
          return;
        }
        setError("Código de acesso inválido.");
      } else if (!client.active) {
        setError("Este acesso foi desativado pelo administrador.");
      } else {
        localStorage.setItem("auth_token", token);
        router.push("/gallery");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao validar acesso. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-black">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-indigo-100 rounded-full text-indigo-600">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Plataforma de Artes
          </h1>
          <p className="mt-2 text-gray-600">
            Insira seu código de acesso para visualizar os packs
          </p>
        </div>

        <form onSubmit={handleAccess} className="mt-8 space-y-6">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700">
              Código de Acesso
            </label>
            <input
              id="token"
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={loading}
              className="block w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black disabled:bg-gray-100"
              placeholder="Digite seu código aqui..."
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex justify-center w-full px-4 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-indigo-400"
          >
            {loading ? "Validando..." : "Acessar Plataforma"}
          </button>
        </form>
      </div>
    </main>
  );
}
