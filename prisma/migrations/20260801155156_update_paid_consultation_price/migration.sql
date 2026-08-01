-- Paid consultation price change: 500 EGP -> 250 EGP
UPDATE "ConsultationType" SET "priceCents" = 25000 WHERE kind = 'PAID';
