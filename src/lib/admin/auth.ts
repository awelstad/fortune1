import "server-only";
import { redirect, unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin access has three gates, all re-checked on every request:
 *   1. signed in            → else the login page
 *   2. on the admin list     → else "not an admin"
 *   3. two-step verified     → else the two-step (MFA) screen
 * The database enforces gates 2 and 3 again on every query (is_admin() requires
 * an aal2 session), so skipping the app can't reach the data.
 */
async function adminState() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, member: false, verified: false } as const;
  const [{ data: member }, { data: aal }] = await Promise.all([
    supabase.rpc("is_admin_member"),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);
  return { supabase, user, member: member === true, verified: aal?.currentLevel === "aal2" } as const;
}

/** For admin pages: returns a client for a verified admin, or redirects. */
export async function requireAdminPage() {
  const { supabase, user, member, verified } = await adminState();
  const requested = (await headers()).get("x-admin-path") ?? "/admin";
  const next = requested.startsWith("/admin") ? requested : "/admin";
  if (!user) redirect("/admin/login");
  if (!member) redirect("/admin/login?error=not-admin");
  if (!verified) redirect(`/admin/mfa?next=${encodeURIComponent(next)}`);
  const { data: admin } = await supabase.from("admin_users").select("role").eq("user_id", user.id).maybeSingle();
  return { supabase, user, role: (admin?.role ?? "editor") as "owner" | "editor" };
}

/** For the two-step screen itself: signed-in admin, verified or not. */
export async function requireAdminMember() {
  const state = await adminState();
  if (!state.user) redirect("/admin/login");
  if (!state.member) redirect("/admin/login?error=not-admin");
  return state;
}

export class AdminError extends Error {}

/** For server actions: throws instead of redirecting. */
export async function requireAdmin() {
  const { supabase, user, member, verified } = await adminState();
  if (!user) throw new AdminError("You are signed out. Please sign in again.");
  if (!member) throw new AdminError("Your account does not have admin access.");
  if (!verified) throw new AdminError("Two-step verification is required. Reload the page and enter your code.");
  const { data: admin } = await supabase.from("admin_users").select("role").eq("user_id", user.id).maybeSingle();
  return { supabase, user, role: (admin?.role ?? "editor") as "owner" | "editor" };
}

/** Purge every cached public page after a content change. */
export function revalidateSite() {
  revalidatePath("/", "layout");
}

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; message: string; errors?: Record<string, string> };

/** Wraps an action body, converting thrown errors into a result object. */
export async function run<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (e) {
    unstable_rethrow(e); // let redirect() / notFound() propagate
    const message = e instanceof Error ? e.message : "Something went wrong.";
    console.error("[admin]", message);
    return { ok: false, message };
  }
}
