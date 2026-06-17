export interface Category {
  id: string;
  name: string;
}

export interface ArtPack {
  id: string;
  title: string;
  mockupUrls: string[];
  downloadUrl: string;
  categoryId: string;
  duration?: number;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  token: string;
  active: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface Promotion {
  id: string;
  title: string;
  price: string;
  imageUrl: string;
  link: string;
  position: "left" | "right";
}

export interface CustomSection {
  id: string;
  name: string;
  icon: string;
  sort_order?: number;
  items: CustomSectionItem[];
}

export interface CustomSectionItem {
  id: string;
  section_id: string;
  title: string;
  description?: string;
  image_url?: string;
  link?: string;
  sort_order?: number;
}

export interface SiteSettings {
  id: string;
  logoUrl: string;
  whatsappLink: string;
  adminPassword: string;
}

// In a real app, this would be a database.
// For now, we'll use a local mock that we can manipulate.
// Note: In Next.js App Router, we'd typically use a DB or a file on the server.

export let categories: Category[] = [
  { id: "1", name: "Social Media" },
  { id: "2", name: "Logotipos" },
  { id: "3", name: "Flyers" },
];

export let artPacks: ArtPack[] = [
  {
    id: "1",
    title: "Pack Hamburgueria",
    mockupUrls: ["https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=400&h=300&fit=crop"],
    downloadUrl: "https://drive.google.com/drive/folders/...",
    categoryId: "1",
    duration: 3,
  },
  {
    id: "2",
    title: "Pack Estética",
    mockupUrls: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=400&h=300&fit=crop"],
    downloadUrl: "https://drive.google.com/drive/folders/...",
    categoryId: "1",
    duration: 3,
  },
];
