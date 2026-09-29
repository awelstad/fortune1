"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-xs text-zinc-400 hover:text-white"
      onClick={async () => {
        await createClient().auth.signOut();
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
