import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { Eyebrow } from "@/components/marketing/eyebrow";
import { ReviewImagesCarousel } from "@/components/marketing/review-images-carousel";
import { getReviewImages } from "@/services/content/cms.service";

export async function ReviewImagesSection() {
  const t = await getTranslations("HomePage.resultsShowcase");
  const images = await getReviewImages();

  if (images.length === 0) return null;

  return (
    <section className="bg-background px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal className="mb-12 flex flex-col items-center gap-3 text-center">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-foreground">
            {t("title")}
          </h2>
          <p className="max-w-2xl text-muted-foreground">{t("subtitle")}</p>
        </ScrollReveal>

        <ReviewImagesCarousel
          images={images.map((image) => ({ id: image.id, url: image.url }))}
        />
      </div>
    </section>
  );
}
