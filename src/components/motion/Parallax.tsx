"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * Scroll-linked parallax + scale for hero media (Apple product-page feel).
 * Uses transform/opacity only, driven by a spring for buttery motion.
 */
export function ParallaxLayer({
  children,
  className,
  distance = 120,
  scale = 1.15,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  scale?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const y = useTransform(smooth, [0, 1], [0, distance]);
  const s = useTransform(smooth, [0, 1], [scale, scale * 1.08]);
  const opacity = useTransform(smooth, [0, 0.7, 1], [1, 1, 0.35]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y, scale: s, opacity }} className="w-full h-full">
        {children}
      </motion.div>
    </div>
  );
}

/** Content that drifts up and fades as the hero scrolls away. */
export function ParallaxFadeUp({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const y = useTransform(smooth, [0, 1], [0, -80]);
  const opacity = useTransform(smooth, [0, 0.6], [1, 0]);

  return (
    <motion.div ref={ref} style={{ y, opacity }} className={className}>
      {children}
    </motion.div>
  );
}
