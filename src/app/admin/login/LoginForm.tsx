"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Field, Input, Notice } from "@/components/admin/ui";

export function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "reset">("password");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(initialError ?? "");
  const [info, setInfo] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    setPending(true);
    setError("");
    setInfo("");
    const supabase = createClient();

    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/confirm?next=/admin/account`,
      });
      setPending(false);
      if (error) setError(error.message);
      else setInfo("If that email belongs to an admin, a reset link is on its way.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password: String(form.get("password") ?? "") });
    if (error) {
      setPending(false);
      setError(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      {error && <Notice tone="error">{error}</Notice>}
      {info && <Notice tone="success">{info}</Notice>}
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required autoFocus />
      </Field>
      {mode === "password" && (
        <Field label="Password" htmlFor="password">
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Please wait…" : mode === "password" ? "Sign in" : "Send reset link"}
      </Button>
      <button
        type="button"
        onClick={() => {
          setMode(mode === "password" ? "reset" : "password");
          setError("");
          setInfo("");
        }}
        className="w-full text-center text-sm text-zinc-500 hover:text-zinc-900"
      >
        {mode === "password" ? "Forgot your password?" : "Back to sign in"}
      </button>
    </form>
  );
}
