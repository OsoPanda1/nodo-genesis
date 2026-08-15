import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizes = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };

export function StarRating({ rating, max = 5, size = "md", interactive = false, onChange }: StarRatingProps) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizes[size],
            "transition-colors",
            i < Math.round(rating)
              ? "fill-accent text-accent"
              : "fill-transparent text-muted-foreground/30",
            interactive && "cursor-pointer hover:text-accent hover:fill-accent/60"
          )}
          onClick={() => interactive && onChange?.(i + 1)}
        />
      ))}
    </div>
  );
}
