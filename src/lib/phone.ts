/**
 * Ghana phone validation and normalization.
 * Accepts 0XXXXXXXXX or +233XXXXXXXXX (with optional spaces/dashes),
 * stores and sends SMS in +233XXXXXXXXX format.
 */
export function normalizeGhanaPhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-()]/g, "");
  let match = cleaned.match(/^0(\d{9})$/);
  if (match) return `+233${match[1]}`;
  match = cleaned.match(/^\+?233(\d{9})$/);
  if (match) return `+233${match[1]}`;
  return null;
}

export function isValidGhanaPhone(raw: string): boolean {
  return normalizeGhanaPhone(raw) !== null;
}

/** Display +233XXXXXXXXX as 0XX XXX XXXX for local readability. */
export function displayGhanaPhone(normalized: string): string {
  const m = normalized.match(/^\+233(\d{2})(\d{3})(\d{4})$/);
  if (!m) return normalized;
  return `0${m[1]} ${m[2]} ${m[3]}`;
}
