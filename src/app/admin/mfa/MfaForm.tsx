"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Field, Input, Notice } from "@/components/admin/ui";

type Enrollment = { id: string; qr: string; secret: string };

/**
 * Two modes:
 *  - verify: the admin already has an authenticator → enter the 6-digit code
 *  - enroll: first time → scan a QR code, then confirm with a code
 */
export function MfaForm({ next, factorId }: { next: string; factorId: string | null }) {
  const router = useRouter();
  const [enroll, setEnroll] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // First-time setup: clear any half-finished attempt, then create a fresh QR code.
  useEffect(() => {
    if (factorId) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data: list } = await supabase.auth.mfa.listFactors();
      for (const f of list?.all ?? []) {
        if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}`,
      });
      if (cancelled) return;
      if (error || !data) setError(error?.message ?? "Couldn't start setup. Reload the page to try again.");
      else setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    })();
    return () => {
      cancelled = true;
    };
  }, [factorId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = factorId ?? enroll?.id;
    if (!id) return;
    setPending(true);
    setError("");
    const { error } = await createClient().auth.mfa.challengeAndVerify({ factorId: id, code: code.replace(/\s/g, "") });
    if (error) {
      setPending(false);
      setCode("");
      setError(/invalid|expired/i.test(error.message) ? "That code didn't work. Wait for a new one and try again." : error.message);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      {error && <Notice tone="error">{error}</Notice>}

      {!factorId && (
        <ol className="space-y-4 text-sm text-zinc-700">
          <li>
            <span className="font-medium text-zinc-900">1. Install an authenticator app</span> — Microsoft Authenticator, Google
            Authenticator, Authy or your password manager.
          </li>
          <li>
            <span className="font-medium text-zinc-900">2. Scan this code</span> with the app.
            <div className="mt-3 grid place-items-center rounded-md border border-zinc-200 bg-white p-4">
              {enroll ? (
                // eslint-disable-next-line @next/next/no-img-element -- data: URL QR code from Supabase
                <img src={enroll.qr} alt="QR code for your authenticator app" width={176} height={176} />
              ) : (
                <div className="grid size-44 place-items-center text-xs text-zinc-400">Preparing…</div>
              )}
            </div>
            {enroll && (
              <button type="button" onClick={() => setShowSecret((s) => !s)} className="mt-2 text-xs text-signal hover:underline">
                {showSecret ? "Hide setup key" : "Can't scan? Enter a key instead"}
              </button>
            )}
            {enroll && showSecret && <p className="mt-1 break-all rounded bg-zinc-100 px-2 py-1.5 font-mono text-xs">{enroll.secret}</p>}
          </li>
          <li>
            <span className="font-medium text-zinc-900">3. Enter the 6-digit code</span> the app shows.
          </li>
        </ol>
      )}

      <Field label="6-digit code" htmlFor="code">
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          required
          autoFocus={!!factorId}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="text-center font-mono text-lg tracking-[0.3em]"
        />
      </Field>
      <Button type="submit" className="w-full" disabled={pending || (!factorId && !enroll)}>
        {pending ? "Checking…" : factorId ? "Verify" : "Turn on and continue"}
      </Button>
      <p className="text-center text-xs text-zinc-500">
        Lost your phone? Ask another admin or the site developer to reset your two-step login.
      </p>
      <button type="button" onClick={signOut} className="w-full text-center text-sm text-zinc-500 hover:text-zinc-900">
        Sign out
      </button>
    </form>
  );
}
