import Image from "next/image";
import { BASE_URL } from "@/utils/axiosUtils/API";

const resolveBrandImage = (image) => {
  if (!image) return "/assets/images/placeholder/brand.png";
  if (/^https?:\/\//i.test(image)) return image;
  return `${BASE_URL}${image.startsWith("/") ? image : `/${image}`}`;
};

const BrandLogo = ({ brand, width = 72, height = 40, className = "" }) => (
  <Image
    src={resolveBrandImage(brand?.image)}
    alt={`${brand?.name || "Brand"} logo`}
    width={width}
    height={height}
    className={className}
    style={{ objectFit: "contain" }}
    unoptimized
  />
);

export default BrandLogo;
