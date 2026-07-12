"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";

export function LoginForm({ shopName }: { shopName: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { signInAction } = await import("./actions");
      const result = await signInAction(email, password);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Sign-in failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm"
    >
      <div className="lg:hidden mb-8 text-center">
        <p className="font-display text-2xl font-semibold">{shopName}</p>
      </div>
      <h2 className="text-3xl font-semibold">Admin sign in</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Enter your admin credentials to manage the store.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <div>
          <label htmlFor="admin-email" className="block text-sm font-semibold mb-1.5">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-4 py-3 text-base transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="block text-sm font-semibold mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-3 pr-12 text-base transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors rounded"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" strokeWidth={1.75} />
              ) : (
                <Eye className="size-4" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-destructive/10 text-destructive text-sm px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent text-on-primary px-6 py-3.5 font-semibold cursor-pointer transition-all duration-200 hover:opacity-90 shadow-md disabled:opacity-60 disabled:cursor-not-allowed min-h-12"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" strokeWidth={2} />
          ) : (
            <Lock className="size-5" strokeWidth={1.75} />
          )}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </motion.div>
  );
}
