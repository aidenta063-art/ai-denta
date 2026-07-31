import { hasLocale } from "next-intl";
import Image from "next/image";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { listMedia } from "@/services/media/media.service";
import { getHomeVideoMediaIds } from "@/services/content/cms.service";
import { deleteMediaAction } from "@/actions/dashboard/media/delete-media";
import {
  attachVideoAction,
  detachVideoAction,
} from "@/actions/dashboard/content/home-videos";
import { MediaUploader } from "@/components/dashboard/media-uploader";
import { MediaType } from "@/generated/prisma/enums";

export default async function MediaLibraryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [media, homeVideoIds] = await Promise.all([
    listMedia(),
    getHomeVideoMediaIds(),
  ]);
  const removeAction = deleteMediaAction.bind(null, locale);
  const attachAction = attachVideoAction.bind(null, locale);
  const detachAction = detachVideoAction.bind(null, locale);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          Media Library
        </h1>
        <Button
          variant="outline"
          size="sm"
          render={<Link href="/dashboard/content" locale={locale} />}
        >
          Back to content
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <MediaUploader />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {media.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No media uploaded yet.
          </p>
        )}
        {media.map((item) => {
          const isOnHomepage = homeVideoIds.has(item.id);
          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="relative flex aspect-video items-center justify-center bg-secondary">
                {item.type === MediaType.IMAGE ? (
                  <Image
                    src={item.url}
                    alt={item.altTextEn ?? "Uploaded image"}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="size-full object-cover"
                    muted
                  />
                )}
              </div>
              <div className="flex flex-col gap-2 p-3">
                <span className="truncate text-xs text-muted-foreground">
                  {item.type}
                </span>
                <div className="flex flex-wrap gap-2">
                  {item.type === MediaType.VIDEO &&
                    (isOnHomepage ? (
                      <form action={detachAction.bind(null, item.id)}>
                        <Button size="sm" variant="outline" type="submit">
                          Remove from homepage
                        </Button>
                      </form>
                    ) : (
                      <form action={attachAction.bind(null, item.id)}>
                        <Button size="sm" variant="secondary" type="submit">
                          Show on homepage
                        </Button>
                      </form>
                    ))}
                  <form action={removeAction.bind(null, item.id)}>
                    <Button size="sm" variant="destructive" type="submit">
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
