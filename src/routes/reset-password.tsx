import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password | SARTAJ" },
      { name: "description", content: "Choose a new password for your SARTAJ admin account." },
      { property: "og:title", content: "Reset password — SARTAJ" },
      { property: "og:description", content: "Choose a new password for your SARTAJ admin account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        className="w-full max-w-sm space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const { error } = await supabase.auth.updateUser({ password });
          setBusy(false);
          if (error) {
            toast.error(error.message);
            return;
          }
          toast.success("Password updated");
          navigate({ to: "/admin" });
        }}
      >
        <Logo />
        <h1 className="pt-6 text-3xl">Set a new password</h1>
        <div className="space-y-2">
          <Label htmlFor="np">New password</Label>
          <Input id="np" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl" />
        </div>
        <Button type="submit" variant="ink" size="xl" className="w-full" disabled={busy}>Update password</Button>
      </form>
    </div>
  );
}
