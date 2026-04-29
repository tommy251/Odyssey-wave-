import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 backdrop-blur-md border-b border-border/40 bg-background/30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-xl font-bold tracking-tight">
          <span className="text-gradient-wave">Odyssey</span>
          <span className="text-foreground"> Wave</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>
            Shop
          </Link>
          <Link to="/about" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>
            About
          </Link>
          <Link to="/contact" className="hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>
            Contact
          </Link>
          <Link
            to="/admin"
            className="rounded-full border border-primary/40 px-4 py-1.5 text-xs uppercase tracking-wider text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
