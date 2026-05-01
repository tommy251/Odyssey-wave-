import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { VideoBackground } from "@/components/VideoBackground";
import { fetchProducts, formatNaira, type Product } from "@/lib/products";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Odyssey Wave - Curated tech for Nigeria" },
      { name: "description", content: "Hand-picked tech that ships fast across Nigeria." },
    ],
  }),
});

function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-24">
        <VideoBackground src="/videos/wave1.mp4" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-primary">Odyssey Wave</p>
          <h1 className="text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            Tech that <span className="text-gradient-wave">moves</span> with you.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Curated gadgets, tested by us, shipped across Nigeria. No noise. Just gear that hits.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="#shop"
              className="rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:scale-105 glow-wave"
            >
              Shop the wave
            </a>
            <Link
              to="/about"
              className="rounded-full border border-border px-8 py-3 font-medium text-foreground hover:bg-card transition-colors"
            >
              Our story
            </Link>
          </div>
        </div>
      </section>

      <section id="shop" className="relative mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Now riding</p>
            <h2 className="text-4xl font-bold md:text-5xl">Featured drops</h2>
          </div>
          <p className="hidden md:block text-sm text-muted-foreground max-w-xs text-right">
            Hand-picked from thousands. Each item earned its spot.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Loading the wave</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.id}
                to="/product/$slug"
                params={{ slug: p.slug }}
                className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card transition-all hover:border-primary/50 hover:-translate-y-1"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-5">
                  {p.category && (
                    <p className="text-[10px] uppercase tracking-widest text-primary mb-2">{p.category}</p>
                  )}
                  <h3 className="font-display text-lg font-semibold leading-tight">{p.name}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xl font-bold text-gradient-wave">{formatNaira(p.price_ngn)}</span>
                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      View
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
