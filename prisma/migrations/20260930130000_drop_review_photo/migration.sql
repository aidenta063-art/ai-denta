-- Reviews shown on the homepage are admin-uploaded result screenshots, not
-- customer-submitted testimonials with a photo — dropping the column added
-- in 20260930120000_add_review_photo, which was the wrong shape.
-- AlterTable
ALTER TABLE "Review" DROP COLUMN "photoMediaId";
