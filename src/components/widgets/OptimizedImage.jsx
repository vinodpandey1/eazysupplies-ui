import Image from "next/image";

const DEFAULT_IMAGE = "/assets/images/placeholder/product.png";

/**
 * App-wide image primitive. It keeps a stable intrinsic size for Next.js image
 * optimization while allowing existing responsive CSS classes to control the
 * rendered size.
 */
const OptimizedImage = ({ src, alt = "", width, height, sizes, unoptimized, ...props }) => {
  const normalizedWidth = Number(width) > 0 ? Number(width) : 750;
  const normalizedHeight = Number(height) > 0 ? Number(height) : 750;
  const resolvedSrc = src || DEFAULT_IMAGE;
  const isRemoteImage = typeof resolvedSrc === "string" && /^https?:\/\//i.test(resolvedSrc);

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={typeof alt === "string" ? alt : ""}
      width={normalizedWidth}
      height={normalizedHeight}
      sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      unoptimized={unoptimized ?? isRemoteImage}
    />
  );
};

export default OptimizedImage;
