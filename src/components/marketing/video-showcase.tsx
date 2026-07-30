import { Play } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { getHomeVideoMedia } from "@/services/content/cms.service";

export async function VideoShowcase() {
  const t = await getTranslations("HomePage.videos");
  const videos = await getHomeVideoMedia();

  return (
    <section className="bg-[#251037] px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal className="mb-12 flex flex-col gap-2 text-center">
          <h2 className="text-3xl font-bold text-white">{t("title")}</h2>
          <p className="text-[#EDE3F5]/70">{t("subtitle")}</p>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-3">
          {videos.length > 0
            ? videos.map((video, i) => (
                <ScrollReveal key={video.id} delay={i * 0.1}>
                  <div className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black">
                    <video
                      src={video.url}
                      className="size-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                    <div className="pointer-events-none absolute flex size-14 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-transform group-hover:scale-110">
                      <Play className="size-6 fill-white text-white" />
                    </div>
                  </div>
                </ScrollReveal>
              ))
            : [0, 1, 2].map((i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div className="group relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#7E00C9]/30 to-[#B98AE8]/20">
                    <div className="flex size-14 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-transform group-hover:scale-110">
                      <Play className="size-6 fill-white text-white" />
                    </div>
                    <p className="absolute bottom-3 px-4 text-center text-sm font-medium text-white/80">
                      {t(`items.${i}`)}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
        </div>
      </div>
    </section>
  );
}
