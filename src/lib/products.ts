import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  name: string;
  slug: string;
  price_ngn: number;
  description: string;
  image_url: string | null;
  category: string | null;
  in_stock: boolean;
  created_at?: string;
};

const SEED: Product[] = [
  {
    id: "demo-1",
    name: "Aurora LED Galaxy Projector",
    slug: "aurora-led-galaxy-projector",
    price_ngn: 14500,
    description:
      "Transform any room into a cosmic wave. 16 colors, remote control, sound-reactive mode. The viral TikTok bedroom upgrade.",
    image_url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80",
    category: "Tech",
    in_stock: true,
  },
  {
    id: "demo-2",
    name: "Pro Wireless Earbuds X1",
    slug: "pro-wireless-earbuds-x1",
    price_ngn: 12000,
    description:
      "Active noise cancelling. 30-hour battery. Touch controls. Crystal sound that punches above its price tag.",
    image_url: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1200&q=80",
    category: "Audio",
    in_stock: true,
  },
  {
    id: "demo-3",
    name: "Smart Watch Wave Series",
    slug: "smart-watch-wave-series",
    price_ngn: 18500,
    description:
      "Heart rate, BP, oxygen, 100+ workout modes. Calls, messages, full notification sync. Sleek titanium-look frame.",
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80",
    category: "Wearables",
    in_stock: true,
  },
];

export async function fetchProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured || !supabase) return SEED;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return SEED;
  return data as Product[];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured || !supabase) {
    return SEED.find((p) => p.slug === slug) ?? null;
  }
  const { data } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (!data) return SEED.find((p) => p.slug === slug) ?? null;
  return data as Product;
}

export function formatNaira(n: number): string {
  return "₦" + n.toLocaleString("en-NG");
}
