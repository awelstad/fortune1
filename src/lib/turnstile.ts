import "server-only";

/**
 * Verifies a Cloudflare Turnstile token. When TURNSTILE_SECRET_KEY isn't
 * configured, verification is skipped (the honeypot + timing checks still run).
 */
export async function verifyTurnstile(token: FormDataEntryValue | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}
