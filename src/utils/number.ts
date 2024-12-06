import toLocaleString from "./toLocaleString";

export function toShortNumber(n: number, decimals: number = 0): string {
  if (n > 1e9) return toLocaleString(n / 1e9, decimals) + "B";
  if (n > 1e6) return toLocaleString(n / 1e6, decimals) + "M";
  if (n > 1e3) return toLocaleString(n / 1e3, decimals) + "K";
  return toLocaleString(n, decimals);
}
