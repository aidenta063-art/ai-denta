"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative w-full max-w-md"
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
          <Image
            src="/logo.png"
            alt="Ai Denta"
            width={160}
            height={72}
            className="h-10 w-auto"
          />
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
