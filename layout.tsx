"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { siteSettings, isLoaded } = useStore();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    
    const token = localStorage.getItem("auth_token");
    const adminPassword = siteSettings?.adminPassword || "admin";
    
    if (token === adminPassword) {
      setAuthorized(true);
    } else {
      router.push("/");
    }
  }, [router, siteSettings, isLoaded]);

  if (!isLoaded) return <div className="p-8 text-center text-black">Carregando...</div>;
  if (!authorized) return <div className="p-8 text-center text-black">Verificando autorização...</div>;

  return <>{children}</>;
}
