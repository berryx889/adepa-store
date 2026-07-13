"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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
    <motion.div whileHover="hover" initial="rest" animate="rest">
      <Link href={`/product/${slug}`} className="group block cursor-pointer">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
          <motion.div
            variants={{ rest: { scale: 1 }, hover: { scale: 1.04 } }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
            <span className="absolute top-3 left-3 rounded-full bg-surface/90 text-primary text-xs font-medium px-3 py-1 backdrop-blur-sm">
              Sold out
            </span>
          )}
        </div>
        <div className="pt-3.5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {categoryName}
          </p>
          <h3 className="mt-1 font-display text-lg leading-snug transition-colors duration-200 group-hover:text-accent">
            {name}
          </h3>
          <p className="mt-1 text-sm text-secondary tabular-nums">{formatGHS(price)}</p>
        </div>
      </Link>
    </motion.div>
  );
}
