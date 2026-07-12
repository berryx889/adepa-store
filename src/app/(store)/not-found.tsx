import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function StoreNotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4 pt-24 pb-16">
      <span className="size-16 rounded-full bg-muted flex items-center justify-center">
        <SearchX className="size-7 text-muted-foreground" strokeWidth={1.5} />
      </span>
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="flex gap-3 mt-2">
        <Button href="/">Go home</Button>
        <Button href="/shop" variant="secondary">
          Browse the shop
        </Button>
      </div>
    </div>
  );
}
