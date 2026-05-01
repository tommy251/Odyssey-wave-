import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira, type Product } from "@/lib/products";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Dashboard — Odyssey Wave Admin" }] }),
});

type Order = {
  id: string;
  product_name: string;
  price_ngn: number;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  status: string;
  created_at: string;
};

function AdminDashboard() {
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    if (!supabase) return;
    setFetchError("");
    try {
      const [p, o] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
      ]);
      if (p.error) throw new Error("Products: " + p.error.message);
      if (o.error) throw new Error("Orders: " + o.error.message);
      if (p.data) setProducts(p.data as Product[]);
      if (o.data) setOrders(o.data as Order[]);
    } catch (err: any) {
      console.error("Dashboard load error:", err);
      setFetchError(err?.message || "Failed to load dashboard data.");
    }
  };

  const signOut = async () => {
    try {
      await supabase?.auth.signOut();
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  // ... rest of the component stays exactly the same (slugify, onUpload, saveProduct, deleteProduct, updateOrderStatus, JSX)