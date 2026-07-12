"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { saveSettings } from "@/app/admin/actions";
import type { ShopSettings } from "@/lib/settings";

const FIELDS: Array<{
  key: keyof ShopSettings;
  label: string;
  help?: string;
  placeholder?: string;
}> = [
  { key: "shopName", label: "Shop name" },
  { key: "tagline", label: "Tagline", help: "Shown in the homepage hero and footer." },
  {
    key: "contactPhone",
    label: "Contact phone",
    placeholder: "024 123 4567",
    help: "Receives the new-order SMS alerts.",
  },
  { key: "whatsappNumber", label: "WhatsApp number", placeholder: "024 123 4567" },
  {
    key: "arkeselSenderId",
    label: "Arkesel sender ID",
    help: "Max 11 characters — must be approved by Arkesel.",
  },
  {
    key: "logoUrl",
    label: "Logo URL",
    help: "Optional. Paste a Cloudinary URL after uploading your logo.",
  },
];

export function SettingsForm({ initial }: { initial: ShopSettings }) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<ShopSettings>(initial);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await saveSettings(form);
      setMessage(
        result.ok
          ? { kind: "ok", text: "Settings saved." }
          : { kind: "error", text: result.error ?? "Could not save" }
      );
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-5">
      {FIELDS.map((field) => (
        <div key={field.key}>
          <label htmlFor={`setting-${field.key}`} className="block text-sm font-semibold mb-1.5">
            {field.label}
          </label>
          <input
            id={`setting-${field.key}`}
            value={form[field.key]}
            placeholder={field.placeholder}
            maxLength={field.key === "arkeselSenderId" ? 11 : undefined}
            onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-base transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10"
          />
          {field.help && (
            <p className="mt-1.5 text-sm text-muted-foreground">{field.help}</p>
          )}
        </div>
      ))}

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
        className="inline-flex items-center gap-2 rounded-lg bg-accent text-on-primary px-6 py-3 font-semibold cursor-pointer transition-all duration-200 hover:opacity-90 shadow-md disabled:opacity-60 disabled:cursor-not-allowed min-h-11"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" strokeWidth={2} />
        ) : (
          <Check className="size-4" strokeWidth={2} />
        )}
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
