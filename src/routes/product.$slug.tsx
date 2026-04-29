import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { VideoBackground } from "@/components/VideoBackground";
import { fetchProductBySlug, formatNaira, type Product } from "@/lib/products";

export const Route = createFileRoute("/product/$slug")({
  component: ProductPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Product not found</h1>
        <Link to="/" className="text-primary mt-4 inline-block">← Back to shop</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground mt-2">{error.message}</p>
      </div>
    </div>
  ),
});

function ProductPage() {
  const { slug } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProductBySlug(slug).then((p) => {
      setProduct(p);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="pt-32 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!product) throw notFound();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative pt-24">
        <VideoBackground src="/videos/wave2.mp4" overlay />
        <div className="relative mx-auto max-w-6xl px-6 py-16 grid gap-12 md:grid-cols-2 items-start">
          <div className="aspect-square overflow-hidden rounded-3xl border border-border/50 bg-card glow-wave">
            {product.image_url && (
              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            {product.category && (
              <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">{product.category}</p>
            )}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{product.name}</h1>
            <p className="mt-4 text-3xl font-bold text-gradient-wave">{formatNaira(product.price_ngn)}</p>
            <p className="mt-6 text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>

            <div className="mt-8 space-y-3">
              <Link
                to="/order/$slug"
                params={{ slug: product.slug }}
                className="block w-full rounded-full bg-primary py-4 text-center font-semibold text-primary-foreground transition-all hover:scale-[1.02] glow-wave"
              >
                Order now — {formatNaira(product.price_ngn)}
              </Link>
              <a
                href={`https://wa.me/2348000000000?text=${encodeURIComponent(`Hi! I'm interested in ${product.name} (${formatNaira(product.price_ngn)})`)}`}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-full border border-border py-4 text-center font-medium hover:bg-card transition-colors"
              >
                Ask on WhatsApp
              </a>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div className="rounded-xl border border-border/40 p-3 text-center">
                <p className="font-semibold text-foreground">2–5 days</p>
                Lagos delivery
              </div>
              <div className="rounded-xl border border-border/40 p-3 text-center">
                <p className="font-semibold text-foreground">5–10 days</p>
                Nationwide
              </div>
              <div className="rounded-xl border border-border/40 p-3 text-center">
                <p className="font-semibold text-foreground">7-day</p>
                Defect return
              </div>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
