"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { deleteZone, saveZone } from "@/app/admin/actions";
import { formatGHS } from "@/lib/money";
import { cn } from "@/lib/cn";

type Zone = { id: string; name: string; fee: number };

export function ZoneManager({ zones }: { zones: Zone[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newFee, setNewFee] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFee, setEditFee] = useState("");

  function toPesewas(cedis: string): number | null {
    const v = parseFloat(cedis);
    if (Number.isNaN(v) || v < 0) return null;
    return Math.round(v * 100);
  }

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, onOk?: () => void) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) setError(result.error ?? "Something went wrong");
      else onOk?.();
    });
  }

  const inputCls =
    "rounded-lg border border-border bg-white px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none";

  return (
    <div className="mt-6 max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fee = toPesewas(newFee);
          if (fee == null) {
            setError("Enter a valid fee in GHS");
            return;
          }
          run(
            () => saveZone(null, newName, fee),
            () => {
              setNewName("");
              setNewFee("");
            }
          );
        }}
        className="flex gap-2 flex-wrap"
      >
        <label htmlFor="new-zone" className="sr-only">
          New zone name
        </label>
        <input
          id="new-zone"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder='Zone name, e.g. "Accra central"'
          className={cn(inputCls, "flex-1 min-w-40 py-2.5")}
        />
        <label htmlFor="new-zone-fee" className="sr-only">
          Fee in GHS
        </label>
        <input
          id="new-zone-fee"
          value={newFee}
          onChange={(e) => setNewFee(e.target.value)}
          type="number"
          step="0.01"
          min="0"
          placeholder="Fee (GH₵)"
          className={cn(inputCls, "w-32 py-2.5")}
        />
        <button
          type="submit"
          disabled={pending || !newName.trim() || !newFee}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent text-on-primary px-4 py-2.5 text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" strokeWidth={2} />
          ) : (
            <Plus className="size-4" strokeWidth={2} />
          )}
          Add
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-destructive/10 text-destructive text-sm px-4 py-3">
          {error}
        </p>
      )}

      <ul className="mt-5 rounded-xl bg-white shadow-md divide-y divide-border overflow-hidden">
        {zones.length === 0 && (
          <li className="px-5 py-8 text-center text-sm text-muted-foreground">
            No zones yet — customers can&apos;t check out until you add at least one.
          </li>
        )}
        {zones.map((zone) => (
          <li key={zone.id} className="flex items-center gap-3 px-5 py-3">
            {editingId === zone.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  aria-label={`Edit ${zone.name} name`}
                  className={cn(inputCls, "flex-1")}
                  autoFocus
                />
                <input
                  value={editFee}
                  onChange={(e) => setEditFee(e.target.value)}
                  type="number"
                  step="0.01"
                  min="0"
                  aria-label={`Edit ${zone.name} fee in GHS`}
                  className={cn(inputCls, "w-28")}
                />
                <button
                  onClick={() => {
                    const fee = toPesewas(editFee);
                    if (fee == null) {
                      setError("Enter a valid fee");
                      return;
                    }
                    run(
                      () => saveZone(zone.id, editName, fee),
                      () => setEditingId(null)
                    );
                  }}
                  disabled={pending}
                  className="p-2 rounded-lg text-success hover:bg-success/10 cursor-pointer transition-colors"
                  aria-label="Save zone"
                >
                  <Check className="size-4" strokeWidth={2} />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
                  aria-label="Cancel editing"
                >
                  <X className="size-4" strokeWidth={2} />
                </button>
              </>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{zone.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatGHS(zone.fee)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingId(zone.id);
                    setEditName(zone.name);
                    setEditFee((zone.fee / 100).toFixed(2));
                  }}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                  aria-label={`Edit ${zone.name}`}
                >
                  <Pencil className="size-4" strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete zone “${zone.name}”?`))
                      run(() => deleteZone(zone.id));
                  }}
                  disabled={pending}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 cursor-pointer transition-colors"
                  aria-label={`Delete ${zone.name}`}
                >
                  <Trash2 className="size-4" strokeWidth={1.75} />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
