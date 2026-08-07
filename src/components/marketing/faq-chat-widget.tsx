"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircleQuestion, X, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

type ChatMessage = { role: "user" | "bot"; text: string };

export function FaqChatWidget({
  questions,
}: {
  questions: { q: string; a: string }[];
}) {
  const t = useTranslations("FaqChat");

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function askQuestion(q: string, a: string) {
    setMessages((prev) => [
      ...prev,
      { role: "user", text: q },
      { role: "bot", text: a },
    ]);
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 start-6 z-30 flex flex-col items-start gap-3"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex h-[28rem] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-[#7E00C9] to-[#251037] px-4 py-3.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Sparkles className="size-4 text-white" />
              </div>
              <p className="text-sm font-semibold text-white">{t("title")}</p>
            </div>

            <div
              ref={logRef}
              className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
            >
              <ChatBubble role="bot" text={t("greeting")} />
              {messages.map((message, i) => (
                <ChatBubble key={i} role={message.role} text={message.text} />
              ))}
            </div>

            <div className="flex flex-col gap-1.5 border-t border-border p-3">
              {questions.map(({ q, a }) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => askQuestion(q, a)}
                  className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-start text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("bubbleLabel")}
        aria-expanded={open}
        className="flex size-14 items-center justify-center rounded-full bg-[#7E00C9] text-white shadow-xl transition-transform hover:scale-105"
      >
        {open ? (
          <X className="size-5" />
        ) : (
          <MessageCircleQuestion className="size-6" />
        )}
      </button>
    </div>
  );
}

function ChatBubble({ role, text }: { role: "user" | "bot"; text: string }) {
  const isUser = role === "user";
  return (
    <div
      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
        isUser
          ? "self-end rounded-ee-sm bg-[#7E00C9] text-white"
          : "self-start rounded-ss-sm bg-secondary text-secondary-foreground"
      }`}
    >
      {text}
    </div>
  );
}
