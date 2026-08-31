/**
 * Compact star-rating + review-count display. Fed by data/products.ts's
 * getRating() helper — see the comment there on why these are placeholder
 * aggregate numbers, not fabricated written reviews.
 */
export default function StarRating({
  stars,
  count,
  size = "sm",
}: {
  stars: number;
  count: number;
  size?: "sm" | "md";
}) {
  const starSize = size === "md" ? "text-[14px]" : "text-[11px]";
  const textSize = size === "md" ? "text-[13px]" : "text-[11px]";

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex items-center gap-0.5 text-yellow-400 ${starSize}`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = stars >= i + 1;
          const half = !filled && stars > i && stars < i + 1;
          return (
            <i
              key={i}
              className={half ? "ri-star-half-fill" : filled ? "ri-star-fill" : "ri-star-line opacity-30"}
            ></i>
          );
        })}
      </div>
      <span className={`font-mono ${textSize} text-foreground-400`}>
        {stars.toFixed(1)} <span className="text-foreground-600">({count})</span>
      </span>
    </div>
  );
}
