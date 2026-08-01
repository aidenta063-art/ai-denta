/** The site currently sells exactly one digital product — no catalog
 * needed yet, so this is a flat constant rather than a CMS-editable model. */
export const PATIENT_FLOW_EBOOK = {
  slug: "patient-flow",
  priceCents: 49900,
  currency: "EGP",
  fileUrl:
    "https://pub-09cdc7847509484fb74711c6843c9957.r2.dev/c0eff784-ab29-4b2f-a8ad-e83f90d25491.pdf",
  authorsEn: ["Dr. Osama Saleh", "Dr. Ahmed Maher"],
  authorsAr: ["الدكتور أسامة صالح", "الدكتور أحمد ماهر"],
} as const;
