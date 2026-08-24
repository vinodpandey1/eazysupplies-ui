import Link from "next/link";
import BrandLogo from "./BrandLogo";

const BrandBadge = ({ brand, compact = false, className = "" }) => {
  if (!brand) return null;

  return (
    <Link
      href={`/brand/${brand.slug || brand.name}`}
      className={`d-inline-flex align-items-center gap-2 rounded-pill border bg-white text-decoration-none ${compact ? "px-2 py-1" : "px-3 py-2"} ${className}`}
      aria-label={`View ${brand.name} products`}
    >
      <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-white" style={{ width: compact ? 28 : 34, height: compact ? 28 : 34, overflow: "hidden" }}>
        <BrandLogo brand={brand} width={compact ? 24 : 30} height={compact ? 24 : 30} />
      </span>
      <span className="fw-semibold text-dark" style={{ fontSize: compact ? 12 : 14, lineHeight: 1.15 }}>{brand.name}</span>
    </Link>
  );
};

export default BrandBadge;
