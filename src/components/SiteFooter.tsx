export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-background/60 mt-20">
      <div className="mx-auto max-w-7xl px-6 py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <h3 className="font-display text-lg mb-2">
            <span className="text-gradient-wave">Odyssey</span> Wave
          </h3>
          <p className="text-muted-foreground">
            Curated tech that moves with the future. Hand-picked, tested, delivered across Nigeria.
          </p>
        </div>
        <div>
          <h4 className="font-medium mb-2">Support</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>WhatsApp: +234 800 000 0000</li>
            <li>Mon–Sat, 9am–7pm WAT</li>
            <li>Pay on delivery in Lagos</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2">Promise</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>7-day returns on defects</li>
            <li>Real photos, real reviews</li>
            <li>Tracked nationwide delivery</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Odyssey Wave. All rights reserved.
      </div>
    </footer>
  );
}
