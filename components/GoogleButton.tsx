"use client";

import { useState } from "react";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";

export default function GoogleButton({ callbackURL }: { callbackURL: string }) {
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    const { error } = await signIn.social({ provider: "google", callbackURL });
    if (error) {
      toast.error(error.message ?? "Google sign in is not available right now.");
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={start} disabled={busy} className="btn btn-outline w-full">
      {busy ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true">
          <path fill="#EA4335" d="M12 10.2v3.900h5.400c-.2 1.300-1.600 3.700-5.400 3.700a6 6 0 0 1 0-12c1.900 0 3.2.8 3.900 1.5l2.700-2.600C16.900 3.100 14.700 2 12 2a10 10 0 1 0 0 20c5.800 0 9.600-4 9.600-9.800 0-.7-.1-1.2-.2-2H12Z" />
        </svg>
      )}
      Continue with Google
    </button>
  );
}
