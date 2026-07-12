import Image from "next/image";
import Link from "next/link";
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
    <Link
      href={`/product/${slug}`}
      className="group block rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 overflow-hidden cursor-pointer"
    >
      <div className="relative aspect-square overflow-hidden bg-primary">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        {soldOut && (
          <span className="absolute top-3 left-3 rounded-full bg-primary/85 text-on-primary text-xs font-semibold px-3 py-1">
            Sold out
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{categoryName}</p>
        <h3 className="mt-1 font-display text-lg font-semibold leading-snug group-hover:text-accent transition-colors duration-200">
          {name}
        </h3>
        <p className="mt-1.5 font-semibold tabular-nums">{formatGHS(price)}</p>
      </div>
    </Link>
  );
}
