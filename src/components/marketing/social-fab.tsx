"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { FaWhatsapp, FaInstagram, FaFacebookF } from "react-icons/fa";

const LINKS = [
  {
    label: "WhatsApp",
    href: "https://wa.me/201097308908",
    Icon: FaWhatsapp,
    className: "bg-[#25D366] text-white",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/ai_denta.agency",
    Icon: FaInstagram,
    className: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/192iYAbhQ3/?mibextid=wwXIfr",
    Icon: FaFacebookF,
    className: "bg-[#1877F2] text-white",
  },
] as const;

export function SocialFab() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 end-6 z-30 flex flex-col items-center gap-3">
      <AnimatePresence>
        {open &&
          LINKS.map(({ label, href, Icon, className }, i) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              initial={{ opacity: 0, y: 12, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.8 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className={`flex size-11 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 ${className}`}
            >
              <Icon className="size-5" />
            </motion.a>
          ))}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Social media links"
        aria-expanded={open}
        className="flex size-14 items-center justify-center rounded-full bg-[#7E00C9] text-white shadow-xl transition-transform hover:scale-105"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-6" />}
      </button>
    </div>
  );
}
