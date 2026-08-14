import type { DiscountType } from "@/generated/prisma/enums";

/** discountValue is in the same unit as priceCents for FIXED (cents), or a
 * whole-number percent (0-100) for PERCENTAGE — see ConsultationType in
 * prisma/schema.prisma. */
export function computeFinalPriceCents({
  priceCents,
  discountEnabled,
  discountType,
  discountValue,
}: {
  priceCents: number;
  discountEnabled: boolean;
  discountType: DiscountType;
  discountValue: number;
}): number {
  if (!discountEnabled) return priceCents;

  const discounted =
    discountType === "PERCENTAGE"
      ? priceCents * (1 - discountValue / 100)
      : priceCents - discountValue;

  return Math.max(0, Math.round(discounted));
}
