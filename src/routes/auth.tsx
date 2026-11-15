import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Logo";

type AuthSearch = { redirect?: string | undefined };

function safePath(p?: string) {
  return p && p.startsWith("/") && !p.startsWith("//") ? p : "/admin";
}

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): AuthSearch => ({
    redirect: typeof s["redirect"] === "string" ? s["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Admin Sign In | SARTAJ" },
      { name: "description", content: "Secure sign in for the SARTAJ store admin dashboard." },
      { property: "og:title", content: "SARTAJ Admin" },
      { property: "og:description", content: "Secure sign in for SARTAJ staff." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const dest = safePath(redirect);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: dest });
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: dest });
    });
    return () => data.subscription.unsubscribe();
  }, [dest, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
        if (!data.session) setNotice("Check your email and click the confirmation link, then sign in here.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setNotice("If that email has an account, a reset link is on its way.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
    if (result.error) toast.error("Google sign-in failed. Please try again.");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="grain relative hidden overflow-hidden bg-ink lg:block">
        <img src="/images/hero-machine.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-ink-foreground">
          <Logo tone="light" />
          <p className="mt-6 max-w-sm font-display text-3xl">Manage your products, gallery and customer enquiries.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden"><Logo /></Link>
          <h1 className="mt-8 text-4xl">
            {mode === "signin" ? "Admin sign in" : mode === "signup" ? "Create admin account" : "Reset password"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup"
              ? "The first account created becomes the store admin."
              : "Only SARTAJ staff with admin access can open the dashboard."}
          </p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl" />
              </div>
            )}
            {notice && <p role="status" className="rounded-xl bg-gold-soft px-4 py-3 text-sm">{notice}</p>}
            <Button type="submit" variant="ink" size="xl" className="w-full" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </Button>
          </form>
          {mode !== "forgot" && (
            <>
              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
              <button
                type="button"
                onClick={google}
                className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border text-sm font-medium"
                style={{ background: "#FFFFFF", borderColor: "#747775", color: "#1F1F1F" }}
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
                Continue with Google
              </button>
            </>
          )}
          <div className="mt-8 flex flex-col gap-2 text-sm">
            {mode === "signin" && (
              <>
                <button type="button" onClick={() => setMode("forgot")} className="text-left text-muted-foreground hover:text-foreground">Forgot password?</button>
                <button type="button" onClick={() => setMode("signup")} className="text-left text-muted-foreground hover:text-foreground">First time? Create the admin account</button>
              </>
            )}
            {mode !== "signin" && (
              <button type="button" onClick={() => setMode("signin")} className="text-left text-muted-foreground hover:text-foreground">← Back to sign in</button>
            )}
            <Link to="/" className="mt-4 text-muted-foreground hover:text-foreground">← Back to website</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
