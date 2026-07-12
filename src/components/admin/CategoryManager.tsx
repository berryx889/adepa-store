"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { cn } from "@/lib/cn";

type Category = { id: string; name: string; slug: string; productCount: number };

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) setError(result.error ?? "Something went wrong");
      else {
        setNewName("");
        setEditingId(null);
      }
    });
  }

  const inputCls =
    "rounded-lg border border-border bg-white px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none";

  return (
    <div className="mt-6 max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newName.trim()) run(() => saveCategory(null, newName));
        }}
        className="flex gap-2"
      >
        <label htmlFor="new-category" className="sr-only">
          New category name
        </label>
        <input
          id="new-category"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name…"
          className={cn(inputCls, "flex-1 py-2.5")}
        />
        <button
          type="submit"
          disabled={pending || !newName.trim()}
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
        {categories.length === 0 && (
          <li className="px-5 py-8 text-center text-sm text-muted-foreground">
            No categories yet — add your first above.
          </li>
        )}
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center gap-3 px-5 py-3">
            {editingId === cat.id ? (
              <>
                <label htmlFor={`edit-${cat.id}`} className="sr-only">
                  Edit {cat.name}
                </label>
                <input
                  id={`edit-${cat.id}`}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={cn(inputCls, "flex-1")}
                  autoFocus
                />
                <button
                  onClick={() => run(() => saveCategory(cat.id, editName))}
                  disabled={pending}
                  className="p-2 rounded-lg text-success hover:bg-success/10 cursor-pointer transition-colors"
                  aria-label="Save category name"
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
                  <p className="text-sm font-medium">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">
                    /{cat.slug} · {cat.productCount} product{cat.productCount === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingId(cat.id);
                    setEditName(cat.name);
                  }}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                  aria-label={`Edit ${cat.name}`}
                >
                  <Pencil className="size-4" strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete category “${cat.name}”?`))
                      run(() => deleteCategory(cat.id));
                  }}
                  disabled={pending}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 cursor-pointer transition-colors"
                  aria-label={`Delete ${cat.name}`}
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
