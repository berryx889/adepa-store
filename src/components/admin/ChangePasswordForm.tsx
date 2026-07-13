"use client";

import { useState, useTransition } from "react";
import { Check, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { changeAdminPassword } from "@/app/admin/actions";

export function ChangePasswordForm() {
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (next.length < 8) {
      setMessage({ kind: "error", text: "New password must be at least 8 characters" });
      return;
    }
    if (next !== confirm) {
      setMessage({ kind: "error", text: "New password and confirmation do not match" });
      return;
    }
    startTransition(async () => {
      const result = await changeAdminPassword(current, next);
      if (result.ok) {
        setMessage({ kind: "ok", text: "Password changed. Use it next time you sign in." });
        setCurrent("");
        setNext("");
        setConfirm("");
      } else {
        setMessage({ kind: "error", text: result.error ?? "Could not change password" });
      }
    });
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-base transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10";

  return (
    <div className="mt-12 max-w-xl">
      <div className="flex items-center gap-2">
        <KeyRound className="size-5 text-accent" strokeWidth={1.75} />
        <h2 className="text-lg font-semibold">Change password</h2>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Update the password you use to sign in to the admin panel.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        <div>
          <label htmlFor="pw-current" className="block text-sm font-semibold mb-1.5">
            Current password
          </label>
          <input
            id="pw-current"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="pw-new" className="block text-sm font-semibold mb-1.5">
            New password
          </label>
          <div className="relative">
            <input
              id="pw-new"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className={inputCls}
              aria-describedby="pw-help"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors rounded"
              aria-label={show ? "Hide passwords" : "Show passwords"}
            >
              {show ? <EyeOff className="size-4" strokeWidth={1.75} /> : <Eye className="size-4" strokeWidth={1.75} />}
            </button>
          </div>
          <p id="pw-help" className="mt-1.5 text-sm text-muted-foreground">
            At least 8 characters.
          </p>
        </div>

        <div>
          <label htmlFor="pw-confirm" className="block text-sm font-semibold mb-1.5">
            Confirm new password
          </label>
          <input
            id="pw-confirm"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputCls}
          />
        </div>

        {message && (
          <p
            role={message.kind === "error" ? "alert" : "status"}
            className={
              message.kind === "ok"
                ? "rounded-lg bg-success/10 text-success text-sm px-4 py-3"
                : "rounded-lg bg-destructive/10 text-destructive text-sm px-4 py-3"
            }
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-primary text-on-primary px-6 py-3 font-medium cursor-pointer transition-all duration-200 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed min-h-11"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" strokeWidth={2} />
          ) : (
            <Check className="size-4" strokeWidth={2} />
          )}
          {pending ? "Saving…" : "Change password"}
        </button>
      </form>
    </div>
  );
}
