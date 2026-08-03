// Manual payment details shown on the payment step for paid consultations
// and the ebook — no payment gateway is wired in yet, so customers
// transfer manually and confirm it themselves via WhatsApp.
export const PAYMENT_METHODS = {
  vodafoneCashNumber: "01097308908",
  instapayLink: "https://ipn.eg/S/lookup.agency/instapay/7VPH6P",
} as const;

// Same number as the site's public contact number (see MarketingFooter),
// in the country-code format wa.me links require.
export const WHATSAPP_NUMBER = "201097308908";
