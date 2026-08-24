import Link from "next/link";
import BrandLogo from "./BrandLogo";

const BrandBadge = ({ brand, compact = false, className = "" }) => {
  if (!brand) return null;

  return (
    <Link
      href={`/brand/${brand.slug || brand.name}`}
      className={`d-inline-flex align-items-center justify-content-center bg-white text-decoration-none ${className}`}
      aria-label={`View ${brand.name} products`}
      title={brand.name}
      style={{
        width: compact ? 62 : 86,
        height: compact ? 34 : 44,
        padding: compact ? "4px 6px" : "5px 8px",
        border: "1px solid #e8ece7",
        borderRadius: compact ? 8 : 10,
        boxShadow: "0 2px 8px rgba(30, 53, 40, 0.05)",
        flex: "0 0 auto",
      }}
    >
      <BrandLogo brand={brand} width={compact ? 48 : 68} height={compact ? 24 : 32} />
    </Link>
  );
};

export default BrandBadge;
