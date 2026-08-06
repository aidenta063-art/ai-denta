"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X } from "lucide-react";
import { RiInstagramLine } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { localized } from "@/lib/i18n-content";
import { getDoctorServiceIcon } from "@/lib/doctor-service-icon";
import type { Locale } from "@/i18n/routing";
import type { DoctorServiceInput } from "@/lib/validation/doctor.schema";

export type DoctorCardData = {
  id: string;
  name: string;
  location: string;
  story: string;
  instagramUrl: string | null;
  photoUrl: string | null;
  services: DoctorServiceInput[];
};

export function DoctorCardsGrid({
  locale,
  doctors,
  labels,
}: {
  locale: Locale;
  doctors: DoctorCardData[];
  labels: {
    viewStory: string;
    close: string;
    successStoryLabel: string;
    servicesLabel: string;
  };
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {doctors.map((doctor) => {
        const expanded = doctor.id === expandedId;

        return (
          <div
            key={doctor.id}
            className={cn(
              "overflow-hidden rounded-3xl border border-border bg-card shadow-sm",
              expanded && "sm:col-span-2 lg:col-span-3",
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {expanded ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex flex-col gap-6 p-6 sm:flex-row"
                >
                  <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-2xl bg-secondary sm:w-64">
                    {doctor.photoUrl ? (
                      <Image
                        src={doctor.photoUrl}
                        alt={doctor.name}
                        fill
                        className="object-cover"
                        sizes="256px"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#7E00C9]/20 to-[#B98AE8]/20 text-4xl font-bold text-primary/40">
                        {doctor.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-card-foreground">
                          {doctor.name}
                        </h3>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0 text-primary" />
                          {doctor.location}
                        </p>
                        {doctor.instagramUrl && (
                          <a
                            href={doctor.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 flex w-fit items-center gap-1.5 text-sm text-primary transition-colors hover:underline"
                          >
                            <RiInstagramLine className="size-3.5 shrink-0" />
                            Instagram
                          </a>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedId(null)}
                        aria-label={labels.close}
                        className="shrink-0 rounded-full border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                        {labels.successStoryLabel}
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {doctor.story}
                      </p>
                    </div>

                    {doctor.services.length > 0 && (
                      <div className="flex flex-col gap-2 border-t border-border pt-4">
                        <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                          {labels.servicesLabel}
                        </span>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {doctor.services.map((service, si) => {
                            const Icon = getDoctorServiceIcon(service.nameEn);
                            return (
                              <div
                                key={si}
                                className="flex gap-2.5 rounded-xl bg-secondary/50 p-3"
                              >
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                                  <Icon className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm font-semibold text-card-foreground">
                                    {localized(
                                      locale,
                                      service.nameEn,
                                      service.nameAr,
                                    )}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {localized(
                                      locale,
                                      service.descriptionEn,
                                      service.descriptionAr,
                                    )}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="collapsed"
                  type="button"
                  onClick={() => setExpandedId(doctor.id)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="group relative block aspect-[3/4] w-full text-start"
                >
                  {doctor.photoUrl ? (
                    <Image
                      src={doctor.photoUrl}
                      alt={doctor.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#7E00C9]/20 to-[#B98AE8]/20 text-4xl font-bold text-primary/40">
                      {doctor.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 text-white">
                    <h3 className="text-lg font-bold">{doctor.name}</h3>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-white/90 underline-offset-4 group-hover:underline">
                      {labels.viewStory}
                    </span>
                  </div>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
