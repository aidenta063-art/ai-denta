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

/** Formats a discountable product's price for display (consultations,
 * the ebook, ...): the final (possibly discounted) price, plus the
 * original price only when a discount is actually knocking the price
 * down — so callers can render the original struck through next to the
 * final price. */
export function formatDiscountedPrice({
  priceCents,
  discountEnabled,
  discountType,
  discountValue,
  currency,
  locale,
}: {
  priceCents: number;
  discountEnabled: boolean;
  discountType: DiscountType;
  discountValue: number;
  currency: string;
  locale: string;
}): { finalLabel: string; originalLabel: string | null } {
  const finalCents = computeFinalPriceCents({
    priceCents,
    discountEnabled,
    discountType,
    discountValue,
  });
  const formatter = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  return {
    finalLabel: formatter.format(finalCents / 100),
    originalLabel:
      discountEnabled && finalCents < priceCents
        ? formatter.format(priceCents / 100)
        : null,
  };
}
