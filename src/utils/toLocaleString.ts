import { BigSource, RoundingMode } from "big.js";

export default function toLocaleString(
  source: BigSource,
  decimals?: number,
  dp?: RoundingMode, // only for Big type
): string {
  if (typeof source === "string") {
    return toLocaleString(Number(source), decimals);
  } else if (typeof source === "number") {
    return decimals !== undefined
      ? source.toLocaleString(undefined, {
          maximumFractionDigits: decimals,
          minimumFractionDigits: decimals,
        })
      : source.toLocaleString();
  } else {
    // Big type
    return toLocaleString(
      decimals !== undefined
        ? Number(source.toFixed(decimals, dp))
        : source.toNumber(),
      decimals,
    );
  }
}
