import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin - Odyssey Wave" }] }),
});

function AdminLayout() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(undefined);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === "SIGNED_IN" && newSession) {
        navigate({ to: "/admin/dashboard" });
      }
      if (event === "SIGNED_OUT") {
        navigate({ to: "/admin" });
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Checking access...</p>
      </div>
    );
  }
  if (!session) {
    return <AdminLogin />;
  }
  return <Outlet />;
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY env vars first.");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      setError(err?.message || "Network error. Check console.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 pt-32 pb-20">
        <h1 className="text-3xl font-bold">Admin login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Restricted area. Only authorized accounts can sign in.
        </p>
        {!isSupabaseConfigured && (
          <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <p className="font-semibold text-destructive">Supabase not configured</p>
            <p className="mt-1 text-muted-foreground">
              Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your environment.
            </p>
          </div>
        )}
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm mb-1.5 text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5 text-muted-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 outline-none focus:border-primary"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <Link to="/" className="mt-6 block text-center text-sm text-muted-foreground hover:text-primary">
          Back to shop
        </Link>
      </div>
    </div>
  );
}
