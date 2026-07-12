import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-full cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.97]";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-on-primary hover:bg-accent-bright hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)] shadow-md",
  secondary:
    "bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-on-primary hover:-translate-y-0.5",
  ghost: "bg-transparent text-primary hover:bg-primary/5",
  light:
    "bg-on-primary text-primary hover:-translate-y-0.5 hover:shadow-lg shadow-md",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-4 py-2 min-h-9",
  md: "px-6 py-3 min-h-11",
  lg: "text-lg px-8 py-4 min-h-12",
};

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const cls = cn(base, variants[variant], sizes[size], className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
