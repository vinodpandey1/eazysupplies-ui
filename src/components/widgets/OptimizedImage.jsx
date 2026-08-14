"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const DEFAULT_IMAGE = "/assets/images/placeholder/product.png";

/**
 * App-wide image primitive. It keeps a stable intrinsic size for Next.js image
 * optimization while allowing existing responsive CSS classes to control the
 * rendered size.
 */
const OptimizedImage = ({ src, alt = "", width, height, sizes, onError, ...props }) => {
  const normalizedWidth = Number(width) > 0 ? Number(width) : 750;
  const normalizedHeight = Number(height) > 0 ? Number(height) : 750;
  const requestedSrc = src || DEFAULT_IMAGE;
  const [activeSrc, setActiveSrc] = useState(requestedSrc);

  useEffect(() => {
    setActiveSrc(requestedSrc);
  }, [requestedSrc]);

  const handleError = (event) => {
    if (activeSrc !== DEFAULT_IMAGE) {
      setActiveSrc(DEFAULT_IMAGE);
    }
    onError?.(event);
  };

  return (
    <Image
      {...props}
      src={activeSrc}
      alt={typeof alt === "string" ? alt : ""}
      width={normalizedWidth}
      height={normalizedHeight}
      sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      onError={handleError}
    />
  );
};

export default OptimizedImage;
