/**
 * Drop-in replacement for next/image in this Vite SPA. Accepts (and
 * ignores) Next-only layout props (`fill`, `sizes`, `priority`) so call
 * sites ported from the Next.js app didn't need every prop list edited —
 * `fill` just becomes "absolute inset-0 w-full h-full object-cover"-style
 * sizing via the parent's own positioning, same visual result the Next
 * <Image fill> mode produced, minus Next's own optimization/CDN resizing
 * (this app has no image-optimization server to call).
 */
import type { ImgHTMLAttributes } from "react";

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}

export default function Image({ src, alt, fill, sizes, priority, className, style, ...rest }: ImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={[fill ? "absolute inset-0 w-full h-full" : "", className].filter(Boolean).join(" ")}
      style={fill ? { objectFit: (rest as { objectFit?: string }).objectFit as never, ...style } : style}
      loading={priority ? "eager" : "lazy"}
      {...rest}
    />
  );
}
