import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { Eyebrow } from "@/components/marketing/eyebrow";
import { ReviewForm } from "@/components/marketing/review-form";
import { ReviewsCarousel } from "@/components/marketing/reviews-carousel";
import { listApprovedReviews } from "@/services/reviews/review.service";

export async function ReviewsSection() {
  const t = await getTranslations("HomePage.reviews");
  const reviews = await listApprovedReviews();
  const cards = reviews.map((review) => ({
    id: review.id,
    name: review.name,
    rating: review.rating,
    text: review.text,
    photoUrl: review.photoMedia?.url ?? null,
  }));

  return (
    <section id="reviews" className="scroll-mt-24 bg-background px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal className="mb-12 flex flex-col items-center gap-3 text-center">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-foreground">
            {t("title")}
          </h2>
          <p className="max-w-2xl text-muted-foreground">{t("subtitle")}</p>
        </ScrollReveal>

        {cards.length > 0 ? (
          <div className="mb-12">
            <ReviewsCarousel reviews={cards} />
          </div>
        ) : (
          <p className="mb-12 text-center text-muted-foreground">
            {t("empty")}
          </p>
        )}

        <ScrollReveal className="mx-auto w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h3 className="mb-4 text-center text-xl font-bold text-card-foreground">
            {t("formTitle")}
          </h3>
          <ReviewForm />
        </ScrollReveal>
      </div>
    </section>
  );
}
