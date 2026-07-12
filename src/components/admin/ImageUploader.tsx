"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, X } from "lucide-react";

/**
 * Uploads to Cloudinary via signed params from /api/upload.
 * Falls back to pasting an image URL/path when Cloudinary isn't configured.
 */
export function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [urlValue, setUrlValue] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const signRes = await fetch("/api/upload", { method: "POST" });
      const sign = await signRes.json();
      if (!signRes.ok) {
        setError(sign.error ?? "Upload not available");
        setUrlMode(true);
        return;
      }
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        form.append("api_key", sign.apiKey);
        form.append("timestamp", String(sign.timestamp));
        form.append("folder", sign.folder);
        form.append("signature", sign.signature);
        const res = await fetch(sign.uploadUrl, { method: "POST", body: form });
        const json = await res.json();
        if (json.secure_url) uploaded.push(json.secure_url);
      }
      if (uploaded.length === 0) {
        setError("Upload failed. Try again or paste an image URL.");
      } else {
        onChange([...images, ...uploaded]);
      }
    } catch {
      setError("Upload failed. Check your connection or paste an image URL.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addUrl() {
    const v = urlValue.trim();
    if (!v) return;
    onChange([...images, v]);
    setUrlValue("");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={`${img}-${i}`} className="relative size-24 rounded-lg overflow-hidden bg-muted group">
            <Image src={img} alt={`Product photo ${i + 1}`} fill sizes="96px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="absolute top-1 right-1 size-6 rounded-full bg-primary/80 text-on-primary flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
              aria-label={`Remove photo ${i + 1}`}
            >
              <X className="size-3.5" strokeWidth={2} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="size-24 rounded-lg border-2 border-dashed border-border hover:border-accent flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-accent cursor-pointer transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="size-5 animate-spin" strokeWidth={1.75} />
          ) : (
            <ImagePlus className="size-5" strokeWidth={1.75} />
          )}
          <span className="text-xs font-medium">{uploading ? "Uploading…" : "Add photo"}</span>
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-3">
        {urlMode ? (
          <div className="flex gap-2 max-w-md">
            <input
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://… or /products/photo.jpg"
              className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={addUrl}
              className="rounded-lg bg-primary text-on-primary px-4 py-2 text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
            >
              Add
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setUrlMode(true)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent cursor-pointer transition-colors"
          >
            <Link2 className="size-3.5" strokeWidth={1.75} />
            Paste image URL instead
          </button>
        )}
      </div>
    </div>
  );
}
