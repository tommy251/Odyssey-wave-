import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { VideoBackground } from "@/components/VideoBackground";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About — Odyssey Wave" },
      { name: "description", content: "Why Odyssey Wave exists. Curated tech for Nigerians who want quality without the markup." },
    ],
  }),
});

function About() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative min-h-[60vh] flex items-center px-6 pt-24">
        <VideoBackground src="/videos/wave2.mp4" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">About us</p>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            We <span className="text-gradient-wave">curate</span>. You ride the wave.
          </h1>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-6 py-20 space-y-8 text-lg text-muted-foreground leading-relaxed">
        <p>
          Odyssey Wave was built for Nigerians who scroll TikTok at midnight and wonder where to actually buy that
          gadget — without paying 5x markup or getting scammed.
        </p>
        <p>
          We hand-pick every product. We test what we can. We only stock what we'd buy ourselves. No fake reviews, no
          "out of stock after payment" tricks. Just real tech, real prices, shipped fast.
        </p>
        <p>
          Built in Lagos. Shipping nationwide. Pay on delivery if you're local. Customer service on WhatsApp because
          that's how Nigerians actually talk.
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}
