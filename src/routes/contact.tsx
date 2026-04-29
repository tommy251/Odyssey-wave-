import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { VideoBackground } from "@/components/VideoBackground";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact — Odyssey Wave" },
      { name: "description", content: "Reach Odyssey Wave on WhatsApp, email, or Instagram. We respond fast." },
    ],
  }),
});

function Contact() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative min-h-[50vh] flex items-center px-6 pt-24">
        <VideoBackground src="/videos/wave1.mp4" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Talk to us</p>
          <h1 className="text-5xl md:text-7xl font-bold">
            Slide into our <span className="text-gradient-wave">DMs</span>.
          </h1>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-6 py-20 grid gap-6 md:grid-cols-2">
        <a
          href="https://wa.me/2348000000000"
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-border/50 bg-card p-8 hover:border-primary transition-all hover:-translate-y-1"
        >
          <p className="text-xs uppercase tracking-widest text-primary">Fastest</p>
          <h3 className="mt-2 text-2xl font-bold">WhatsApp</h3>
          <p className="mt-2 text-muted-foreground">+234 800 000 0000</p>
          <p className="mt-4 text-sm text-muted-foreground">Mon–Sat · 9am–7pm WAT</p>
        </a>
        <a
          href="mailto:tommybab7@gmail.com"
          className="rounded-2xl border border-border/50 bg-card p-8 hover:border-primary transition-all hover:-translate-y-1"
        >
          <p className="text-xs uppercase tracking-widest text-primary">Email</p>
          <h3 className="mt-2 text-2xl font-bold">tommybab7@gmail.com</h3>
          <p className="mt-2 text-muted-foreground">Replies within 24h</p>
        </a>
      </section>
      <SiteFooter />
    </div>
  );
}
