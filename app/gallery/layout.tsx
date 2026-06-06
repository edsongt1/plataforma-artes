"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateAccess = async () => {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        router.push("/");
        return;
      }

      if (token === "admin") {
        setIsValidating(false);
        return;
      }

      // Valida o token no Supabase em tempo real
      const { data, error } = await supabase
        .from("clients")
        .select("active, end_date")
        .eq("token", token)
        .single();

      if (error || !data) {
        localStorage.removeItem("auth_token");
        router.push("/");
        return;
      }

      // Verifica se a assinatura expirou
      const isExpired = data.end_date ? new Date(data.end_date) < new Date() : false;

      if (!data.active || isExpired) {
        localStorage.removeItem("auth_token");
        router.push("/");
        return;
      }

      setIsValidating(false);
    };

    validateAccess();

    // Opcional: Verificar a cada 30 segundos se o acesso ainda é válido
    const interval = setInterval(validateAccess, 30000);
    return () => clearInterval(interval);
  }, [router]);

  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
