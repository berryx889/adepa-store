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
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] text-on-primary max-w-xl">
        {words.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            className="inline-block mr-[0.28em]"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
          </motion.span>
        ))}
      </h1>
      <motion.p
        className="mt-5 text-base sm:text-lg text-on-primary/75 max-w-md font-light leading-relaxed"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 + words.length * 0.07, ease: "easeOut" }}
      >
        {subtitle}
      </motion.p>
      <motion.div
        className="mt-8 flex flex-wrap gap-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 + words.length * 0.07, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
