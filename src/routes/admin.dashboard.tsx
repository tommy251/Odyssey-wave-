import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira, type Product } from "@/lib/products";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Dashboard - Odyssey Wave Admin" }] }),
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

  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const onUpload = async (file: File): Promise<string | null> => {
    if (!supabase) return null;
    setUploading(true);
    try {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      return data.publicUrl;
    } catch (err: any) {
      console.error("Upload error:", err);
      setMsg("Upload failed: " + (err?.message || "Unknown error"));
      return null;
    } finally {
      setUploading(false);
    }
  };

  const saveProduct = async () => {
    if (!supabase || !editing) return;
    setMsg("");
    try {
      const payload = {
        name: editing.name ?? "",
        slug: editing.slug || slugify(editing.name ?? ""),
        price_ngn: Number(editing.price_ngn) || 0,
        description: editing.description ?? "",
        image_url: editing.image_url ?? null,
        category: editing.category ?? null,
        in_stock: editing.in_stock ?? true,
      };
      if (!payload.name || !payload.slug || !payload.price_ngn) {
        setMsg("Name, slug, and price are required");
        return;
      }
      const res = editing.id
        ? await supabase.from("products").update(payload).eq("id", editing.id)
        : await supabase.from("products").insert(payload);
      if (res.error) throw res.error;
      setEditing(null);
      setMsg("Saved.");
      loadAll();
    } catch (err: any) {
      console.error("Save product error:", err);
      setMsg("Save failed: " + (err?.message || "Unknown error"));
    }
  };

  const deleteProduct = async (id: string) => {
    if (!supabase || !confirm("Delete this product?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      loadAll();
    } catch (err: any) {
      console.error("Delete error:", err);
      setMsg("Delete failed: " + (err?.message || "Unknown error"));
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
      loadAll();
    } catch (err: any) {
      console.error("Order update error:", err);
      setMsg("Order update failed: " + (err?.message || "Unknown error"));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-6 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button onClick={signOut} className="text-sm text-muted-foreground hover:text-primary">
            Sign out
          </button>
        </div>

        <div className="flex gap-2 mb-6 border-b border-border">
          {(["products", "orders"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 capitalize text-sm font-medium border-b-2 -mb-px ${
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"
              }`}
            >
              {t} {t === "orders" && orders.length > 0 && `(${orders.length})`}
            </button>
          ))}
        </div>

        {msg && <p className="mb-4 text-sm text-primary">{msg}</p>}
        {fetchError && <p className="mb-4 text-sm text-destructive">{fetchError}</p>}

        {tab === "products" && (
          <>
            <button
              onClick={() => setEditing({ in_stock: true })}
              className="mb-6 rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
            >
              + Add product
            </button>

            {editing && (
              <div className="mb-8 rounded-2xl border border-border bg-card p-6 space-y-4">
                <h3 className="font-bold">{editing.id ? "Edit" : "New"} product</h3>
                <Input
                  label="Name"
                  value={editing.name ?? ""}
                  onChange={(v) => setEditing({ ...editing, name: v, slug: editing.slug || slugify(v) })}
                />
                <Input
                  label="Slug (URL)"
                  value={editing.slug ?? ""}
                  onChange={(v) => setEditing({ ...editing, slug: v })}
                />
                <Input
                  label="Price (NGN)"
                  type="number"
                  value={String(editing.price_ngn ?? "")}
                  onChange={(v) => setEditing({ ...editing, price_ngn: Number(v) })}
                />
                <Input
                  label="Category"
                  value={editing.category ?? ""}
                  onChange={(v) => setEditing({ ...editing, category: v })}
                />
                <div>
                  <label className="block text-sm mb-1.5 text-muted-foreground">Description</label>
                  <textarea
                    rows={4}
                    value={editing.description ?? ""}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background/50 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1.5 text-muted-foreground">Image</label>
                  {editing.image_url && (
                    <img src={editing.image_url} alt="" className="h-32 w-32 rounded-lg object-cover mb-2" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = await onUpload(f);
                      if (url) setEditing({ ...editing, image_url: url });
                    }}
                    className="text-sm"
                  />
                  {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveProduct}
                    className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="rounded-full border border-border px-6 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <div key={p.id} className="rounded-xl border border-border bg-card overflow-hidden">
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} className="h-40 w-full object-cover" />
                  )}
                  <div className="p-4">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gradient-wave font-bold">{formatNaira(p.price_ngn)}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setEditing(p)}
                        className="text-xs px-3 py-1 rounded-full border border-border"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="text-xs px-3 py-1 rounded-full border border-destructive/40 text-destructive"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <p className="text-muted-foreground col-span-full">No products yet. Add one above.</p>
              )}
            </div>
          </>
        )}

        {tab === "orders" && (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="p-3 text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{o.full_name}</p>
                      <p className="text-xs text-muted-foreground">{o.phone}</p>
                    </td>
                    <td className="p-3">{o.product_name}</td>
                    <td className="p-3 font-medium">{formatNaira(o.price_ngn)}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {o.address}, {o.city}, {o.state}
                    </td>
                    <td className="p-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        className="rounded border border-input bg-background px-2 py-1 text-xs"
                      >
                        <option value="new">New</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm mb-1.5 text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-background/50 px-4 py-3"
      />
    </div>
  );
}
