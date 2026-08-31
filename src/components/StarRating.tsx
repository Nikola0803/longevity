export default function StarRating({ stars, count }: { stars: number; count: number }) {
  const full = Math.round(stars);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5 text-primary-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <i key={i} className={i < full ? "ri-star-fill text-[11px]" : "ri-star-line text-[11px] text-foreground-600"} />
        ))}
      </div>
      <span className="font-mono text-[10px] text-foreground-500">
        {stars.toFixed(1)} ({count})
      </span>
    </div>
  );
}
