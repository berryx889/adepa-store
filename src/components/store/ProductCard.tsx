"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { formatGHS } from "@/lib/money";

type ProductCardProps = {
  slug: string;
  name: string;
  price: number;
  image: string;
  categoryName: string;
  stock: number;
};

export function ProductCard({ slug, name, price, image, categoryName, stock }: ProductCardProps) {
  const soldOut = stock <= 0;
  return (
    <motion.div
      whileHover="hover"
      whileTap={{ scale: 0.985 }}
      initial="rest"
      animate="rest"
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <Link
        href={`/product/${slug}`}
        className="group block rounded-2xl bg-surface shadow-md overflow-hidden cursor-pointer will-change-transform"
      >
        <motion.div
          variants={{ rest: { y: 0 }, hover: { y: -6, boxShadow: "var(--shadow-lg)" } }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="rounded-2xl bg-surface"
        >
          <div className="relative aspect-square overflow-hidden bg-primary">
            <motion.div
              variants={{ rest: { scale: 1 }, hover: { scale: 1.06 } }}
              transition={{ type: "spring", stiffness: 200, damping: 26 }}
              className="absolute inset-0"
            >
              <Image
                src={image}
                alt={name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                className="object-cover"
              />
            </motion.div>
            {soldOut && (
              <span className="absolute top-3 left-3 rounded-full bg-primary/85 text-on-primary text-xs font-semibold px-3 py-1 backdrop-blur-sm">
                Sold out
              </span>
            )}
            <motion.span
              variants={{ rest: { opacity: 0, scale: 0.8 }, hover: { opacity: 1, scale: 1 } }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute top-3 right-3 size-9 rounded-full bg-surface/90 backdrop-blur-sm flex items-center justify-center shadow-md"
            >
              <ArrowUpRight className="size-4 text-accent" strokeWidth={2.25} />
            </motion.span>
          </div>
          <div className="p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {categoryName}
            </p>
            <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug transition-colors duration-200 group-hover:text-terracotta">
              {name}
            </h3>
            <p className="mt-1.5 font-semibold tabular-nums">{formatGHS(price)}</p>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
