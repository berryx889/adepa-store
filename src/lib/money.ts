/** Format pesewas as "GH₵ 120.00" — the only currency format in the app. */
export function formatGHS(pesewas: number): string {
  const cedis = pesewas / 100;
  return `GH₵ ${cedis.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
