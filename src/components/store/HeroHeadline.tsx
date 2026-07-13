"use client";

import { motion } from "framer-motion";

/** Word-by-word headline reveal for the homepage hero. */
export function HeroHeadline({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  const words = title.split(" ");
  return (
    <div>
      <h1 className="font-display text-[2.6rem] leading-[1.08] sm:text-6xl sm:leading-[1.05] tracking-tight max-w-xl">
        {words.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            className="inline-block mr-[0.26em]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        ))}
      </h1>
      <motion.p
        className="mt-6 text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 + words.length * 0.06, ease: "easeOut" }}
      >
        {subtitle}
      </motion.p>
      <motion.div
        className="mt-9 flex flex-wrap items-center gap-2"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.22 + words.length * 0.06, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
