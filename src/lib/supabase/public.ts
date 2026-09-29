import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-less anon client for public, cacheable reads. Using this (instead of
 * the cookie-aware server client) keeps public pages statically renderable.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
