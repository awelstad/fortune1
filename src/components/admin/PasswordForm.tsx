"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Field, Input, Notice } from "./ui";

export function PasswordForm() {
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        const password = String(fd.get("password") ?? "");
        if (password.length < 10) return setMsg({ tone: "error", text: "Use at least 10 characters." });
        if (password !== fd.get("confirm")) return setMsg({ tone: "error", text: "Passwords don't match." });
        setPending(true);
        const { error } = await createClient().auth.updateUser({ password });
        setPending(false);
        if (error) return setMsg({ tone: "error", text: error.message });
        form.reset();
        setMsg({ tone: "success", text: "Password updated." });
      }}
    >
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      <Field label="New password" htmlFor="password" hint="At least 10 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} />
      </Field>
      <Field label="Confirm password" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Update password"}
      </Button>
    </form>
  );
}
