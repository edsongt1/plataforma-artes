import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Art Pack Platform",
  description: "Sua plataforma de packs de artes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
