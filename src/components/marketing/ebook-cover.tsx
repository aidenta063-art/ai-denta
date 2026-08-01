import Image from "next/image";
import { cn } from "@/lib/utils";

export function EbookCover({
  locale,
  className,
}: {
  locale: string;
  className?: string;
}) {
  const isAr = locale === "ar";

  return (
    <div
      className={cn(
        "relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-2xl shadow-black/40",
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#7E00C9] via-[#9a4fd6] to-[#B98AE8]" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/15 to-transparent" />
      <div className="relative flex h-full flex-col items-center justify-between p-5 text-center sm:p-7">
        <Image
          src="/logo-mark.png"
          alt=""
          width={40}
          height={40}
          className="size-8 brightness-0 invert sm:size-10"
        />
        <div className="flex flex-col gap-2">
          <h3 className="text-xl leading-tight font-extrabold text-white sm:text-3xl">
            {isAr ? "تدفق المرضى" : "Patient Flow"}
          </h3>
          <p className="text-[11px] font-medium text-white/80 sm:text-sm">
            {isAr
              ? "كيف تحول مرضاك إلى عملاء دائمين"
              : "Turn patients into loyal clients"}
          </p>
        </div>
        <p className="text-[9px] font-semibold tracking-widest text-white/70 uppercase sm:text-[11px]">
          Ai denta
        </p>
      </div>
    </div>
  );
}
