"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";
import { goAfterLogin, withRedirect } from "@/lib/return-path";
import { passwordProblem } from "@/lib/validation";
import GoogleButton from "./GoogleButton";

export default function RegisterForm({ redirectTo, googleEnabled }: { redirectTo: string; googleEnabled: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const problem = passwordProblem(password);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    const { error: signUpError } = await signUp.email({ name: name.trim(), email, password });
    if (signUpError) {
      const message = signUpError.status === 422 ? "An account with this email already exists." : signUpError.message ?? "Registration failed. Please try again.";
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
        <h1 className="section-title">Create your account</h1>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Name</span>
            <input required minLength={2} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="input w-full" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
            <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input w-full" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Password</span>
            <input type="password" required autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="input w-full" />
            <span className="mt-1 block text-xs text-base-content/60">At least 6 characters, with an uppercase and a lowercase letter.</span>
          </label>
          {error && <p role="alert" className="flex items-start gap-2 text-sm text-error"><AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}</p>}
          <button className="btn btn-primary w-full" disabled={busy}>{busy && <span className="loading loading-spinner loading-xs" />} Register</button>
        </form>

        {googleEnabled && (
          <>
            <div className="divider text-xs text-base-content/60">OR</div>
            <GoogleButton callbackURL={redirectTo} />
          </>
        )}

        <p className="mt-5 text-center text-sm">Already have an account? <Link href={withRedirect("/login", redirectTo)} className="font-medium text-primary underline">Login</Link></p>
      </div>
    </div>
  );
}
