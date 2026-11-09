
"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { Photo } from "@/components/ui/Photo";
import { curatedImage, GENERIC_MOUNTAINS } from "@/lib/place-images";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        setError(result.error || result.message || "Sign-in failed. Please try again.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Cannot reach the server. Check that Safar is running and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-[#0e1612] lg:block">
        <Photo src={curatedImage("hunza", 1800) ?? GENERIC_MOUNTAINS(1800)} alt="Mountain valley in Hunza" priority className="absolute inset-0 h-full w-full" />
        <div className="img-scrim absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="text-3xl font-semibold leading-tight">Every great journey begins with a plan.</p>
          <p className="mt-3 max-w-md text-white/75">Your private workspace for travel enquiries and booking requests.</p>
        </div>
      </div>

      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link href="/" className="flex w-fit items-center gap-2.5" aria-label="Safar home">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm font-bold text-white">S</span>
          <span className="text-lg font-semibold tracking-tight">Safar</span>
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-semibold">Admin sign in</h1>
          <p className="mt-2 text-sm text-muted">Sign in to manage booking requests.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="admin-email" className="label">Email</label>
              <input id="admin-email" name="email" type="email" autoComplete="username" required maxLength={254}
                value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="field" />
            </div>
            <div>
              <label htmlFor="admin-password" className="label">Password</label>
              <div className="relative">
                <input id="admin-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password"
                  required maxLength={200} value={password} onChange={(e) => setPassword(e.target.value)} className="field pr-11" />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted hover:text-ink">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && <p role="alert" className="rounded-lg border border-red-300/60 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>}

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full min-h-12">
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : "Sign in"}
            </button>
          </form>
        </div>

        <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm text-muted hover:text-ink">
          <ArrowLeft size={15} /> Back to Safar
        </Link>
      </div>
    </main>
  );
}
