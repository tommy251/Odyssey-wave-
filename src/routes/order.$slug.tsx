import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { fetchProductBySlug, formatNaira, type Product } from "@/lib/products";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

export const Route = createFileRoute("/order/$slug")({
  component: OrderPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <p>Product not found.</p>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-destructive">{error.message}</p>
    </div>
  ),
});

function OrderPage() {
  const { slug } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ id: string } | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "Lagos",
    notes: "",
  });

  useEffect(() => {
    fetchProductBySlug(slug).then(setProduct);
  }, [slug]);

  if (!product) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="pt-32 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const saveOrder = async (reference: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error: dbErr } = await supabase
        .from("orders")
        .insert({
          product_id: product.id,
          product_name: product.name,
          price_ngn: product.price_ngn,
          ...form,
          status: "paid",
        })
        .select("id")
        .single();
      if (dbErr) throw new Error(dbErr.message);
      return data?.id || reference;
    }
    return reference;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.full_name || !form.phone || !form.address) {
      setError("Please fill name, phone, and address.");
      return;
    }

    setSubmitting(true);

    try {
      const PaystackPop = (window as any).PaystackPop;

      if (!PaystackPop) {
        throw new Error("Payment system not loaded. Please refresh and try again.");
      }

      const handler = PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: form.phone + "@odysseywave.ng",
        amount: product.price_ngn * 100,
        currency: "NGN",
        ref: "OW-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
        metadata: {
          custom_fields: [
            { display_name: "Customer Name", variable_name: "full_name", value: form.full_name },
            { display_name: "Phone", variable_name: "phone", value: form.phone },
            { display_name: "Address", variable_name: "address", value: form.address + ", " + form.city + ", " + form.state },
            { display_name: "Product", variable_name: "product", value: product.name },
          ],
        },
        callback: async (response: any) => {
          try {
            const orderId = await saveOrder(response.reference);
            setDone({ id: orderId });
            const waText = encodeURIComponent(
              "Hi! I just paid for order on Odyssey Wave.\nProduct: " + product.name +
              "\nAmount: " + formatNaira(product.price_ngn) +
              "\nRef: " + response.reference +
              "\nName: " + form.full_name +
              "\nPhone: " + form.phone +
              "\nAddress: " + form.address + ", " + form.city + ", " + form.state
            );
            window.open("https://wa.me/2348000000000?text=" + waText, "_blank");
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setSubmitting(false);
          }
        },
        onClose: () => {
          setSubmitting(false);
        },
      });

      handler.openIframe();
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-6 pt-32 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold">Payment successful!</h1>
          <p className="mt-3 text-muted-foreground">
            Order ID: <span className="text-primary font-mono">#{done.id.slice(0, 8)}</span>
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            We will confirm on WhatsApp shortly. Keep your phone close.
          </p>
          <Link to="/" className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-primary-foreground font-medium">
            Back to shop
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 pt-32 pb-20">
        <Link to="/product/$slug" params={{ slug }} className="text-sm text-muted-foreground hover:text-primary">
          Back to product
        </Link>
        <h1 className="mt-4 text-4xl font-bold">Complete your order</h1>
        <div className="mt-2 mb-8 flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-4">
          {product.image_url && (
            <img src={product.image_url} alt={product.name} className="h-16 w-16 rounded-lg object-cover" />
          )}
          <div className="flex-1">
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-gradient-wave font-bold">{formatNaira(product.price_ngn)}</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
          <Field label="Phone (WhatsApp)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="08012345678" />
          <Field label="Delivery address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Field label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
          </div>
          <div>
            <label className="block text-sm mb-1.5 text-muted-foreground">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 outline-none focus:border-primary"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-primary py-4 font-semibold text-primary-foreground transition-all hover:scale-[1.02] disabled:opacity-50 glow-wave"
          >
            {submitting ? "Opening payment..." : "Pay " + formatNaira(product.price_ngn) + " securely"}
          </button>
          <p className="text-xs text-center text-muted-foreground">
            Secured by Paystack. Card, bank transfer and USSD accepted.
          </p>
        </form>
      </div>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm mb-1.5 text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 outline-none focus:border-primary"
      />
    </div>
  );
}
