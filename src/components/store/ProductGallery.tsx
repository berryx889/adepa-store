"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : ["/hero.jpg"];

  return (
    <div>
      <div className="relative aspect-square rounded-xl overflow-hidden bg-primary shadow-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <Image
              src={list[active]}
              alt={`${name} — photo ${active + 1} of ${list.length}`}
              fill
              priority={active === 0}
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-3" role="group" aria-label="Product photos">
          {list.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              className={cn(
                "relative size-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200",
                i === active ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
              )}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === active}
            >
              <Image src={img} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
