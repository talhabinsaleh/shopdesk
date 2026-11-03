"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { goAfterLogin, withRedirect } from "@/lib/return-path";
import GoogleButton from "./GoogleButton";

const DEMOS = [
  { label: "Admin", email: "admin@shopdesk.demo", password: "Ledger-Owner-5173" },
  { label: "Customer", email: "customer@shopdesk.demo", password: "Ledger-Buyer-8302" },
];

export default function LoginForm({ redirectTo, googleEnabled }: { redirectTo: string; googleEnabled: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const { error: signInError } = await signIn.email({ email, password });
    if (signInError) {
      const message = signInError.status === 401 ? "That email or password is not correct." : signInError.message ?? "Login failed. Please try again.";
      setError(message);
      toast.error(message);
      setBusy(false);
      return;
    }
    goAfterLogin(redirectTo);
  }

  return (
    <div className="page-shell grid min-h-[75vh] place-items-center py-12">
      <div className="w-full max-w-md rounded-box border border-base-300 bg-base-200 p-6 sm:p-8">
        <h1 className="section-title">Login</h1>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
            <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input w-full" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Password</span>
            <input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="input w-full" />
          </label>
          {error && <p role="alert" className="flex items-start gap-2 text-sm text-error"><AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}</p>}
          <button className="btn btn-primary w-full" disabled={busy}>{busy && <span className="loading loading-spinner loading-xs" />} Login</button>
        </form>

        {googleEnabled && (
          <>
            <div className="divider text-xs text-base-content/60">OR</div>
            <GoogleButton callbackURL={redirectTo} />
          </>
        )}

        <div className="mt-5 rounded-field border border-dashed border-base-content/25 p-3">
          <p className="text-xs font-medium text-base-content/70">Try a demo account</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {DEMOS.map((demo) => (
              <button key={demo.label} type="button" className="btn btn-outline btn-xs" onClick={() => { setEmail(demo.email); setPassword(demo.password); }}>{demo.label}</button>
            ))}
          </div>
        </div>

        <p className="mt-5 text-center text-sm">New to ShopDesk? <Link href={withRedirect("/register", redirectTo)} className="font-medium text-primary underline">Register</Link></p>
      </div>
    </div>
  );
}
