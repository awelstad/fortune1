import "server-only";
import { redirect, unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * For admin pages: returns an authenticated Supabase client for a verified
 * admin, or redirects. RLS enforces the same rule at the database.
 */
export async function requireAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase.from("admin_users").select("role").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/admin/login?error=not-admin");

  return { supabase, user, role: admin.role as "owner" | "editor" };
}

export class AdminError extends Error {}

/** For server actions: throws instead of redirecting. */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AdminError("You are signed out. Please sign in again.");
  const { data: admin } = await supabase.from("admin_users").select("role").eq("user_id", user.id).maybeSingle();
  if (!admin) throw new AdminError("Your account does not have admin access.");
  return { supabase, user, role: admin.role as "owner" | "editor" };
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
