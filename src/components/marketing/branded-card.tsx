"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function BrandedCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("relative w-full max-w-md", className)}
    >
      <div
        className="absolute inset-x-10 -top-4 h-8 rounded-full bg-[#7E00C9]/50 blur-2xl"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-2xl shadow-black/30 backdrop-blur">
        <div
          className="h-1.5 w-full bg-gradient-to-r from-[#7E00C9] via-[#9a4fd6] to-[#B98AE8]"
          aria-hidden
        />
        <div className="flex flex-col items-center gap-1 px-8 pt-8 pb-2 text-center">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-mark.png"
              alt=""
              width={32}
              height={32}
              className="size-8"
            />
            <span className="text-lg font-bold tracking-tight text-[#251037]">
              Ai denta
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#251037]">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="px-8 pb-8 pt-4">{children}</div>
      </div>
    </motion.div>
  );
}
