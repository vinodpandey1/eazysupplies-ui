import OptimizedImage from "@/components/widgets/OptimizedImage";
import Link from "next/link";
import React from "react";
import { RiDiscountPercentFill, RiStarSFill } from "react-icons/ri";
import { placeHolderImage } from "../Placeholder";
import CartButton from "./widgets/CartButton";
import WishlistButton from "./widgets/hoverButton/WishlistButton";
import ProductBoxVariantAttribute from "./widgets/ProductBoxVariantAttributes";
import ProductHoverButton from "./widgets/ProductHoverButton";
import BrandBadge from "@/components/widgets/BrandBadge";
import ProductPrice from "./widgets/ProductPrice";

const ProductBox2 = ({ productState, setProductState, onNavigate }) => {
  const getFirstOriginalUrl = (filesString) => {
    if (!filesString) return null;
    const [firstFile] = filesString.split(",");
    const trimmedFile = firstFile?.trim();
    if (!trimmedFile) return null;

    try {
      const url = new URL(process.env.NEXT_PUBLIC_FILE_API_URL || "https://api.eazysupplies.com/api/file");
      url.searchParams.set("file", trimmedFile);
      return url.toString();
    } catch {
      return null;
    }
  };

  const originalUrl = getFirstOriginalUrl(productState?.product?.productImage);
  const ratingCount = Number(productState?.product?.reviews_count);
  return (
    <div className={`basic-product theme-product-1 ${productState?.product?.stock_status === "out_of_stock" ? "sold-out" : ""}`}>
      <div className="overflow-hidden">
        <div className="img-wrapper">
          {productState?.product?.is_trending || productState?.product?.is_sale_enable || productState?.product?.is_featured ? (
            <div className={`ribbon ${productState?.product?.is_sale_enable ? "sale-tag" : productState?.product?.is_featured ? "featured-tag" : productState?.product?.is_trending ? "trending-tag" : ""}`}>
              <span>{productState?.product?.is_sale_enable ? "sale" : productState?.product?.is_featured ? "featured" : productState?.product?.is_trending ? "trending" : ""}</span>
            </div>
          ) : null}

          <Link href={`/product/${productState?.product?.id}`} onClick={onNavigate}>
            <OptimizedImage src={originalUrl ? originalUrl : placeHolderImage} className="img-fluid bg-img" alt={productState?.product?.name} />
          </Link>
          {Number.isFinite(ratingCount) && ratingCount > 0 && (
            <div className="rating-label">
              <RiStarSFill />
              <span>{ratingCount}</span>
            </div>
          )}
          <div className="cart-info">
            {/* <WishlistButton customAnchor={true} productstate={productState?.product} /> */}
            <CartButton productState={productState} selectedVariation={productState.selectedVariation} />
            {/* <ProductHoverButton productstate={productState?.product} actionsToHide={"wishlist"} /> */}
          </div>
        </div>
        <div className="product-detail">
          <div>
            <div className="brand-w-color">
              <Link className="product-title product-title-highlight" href={`/product/${productState?.product?.id}`} onClick={onNavigate}>
                {productState?.product?.name}
              </Link>
              <div className="color-panel">
                <ProductBoxVariantAttribute showVariableType={["color", "image"]} productState={productState} setProductState={setProductState} />
              </div>
            </div>
            <BrandBadge brand={productState?.product?.brand} compact className="mb-2" />
            <ProductPrice product={productState?.product} variation={productState?.selectedVariation} />
            <div className="product-card-cart-action"><CartButton productState={productState} text={"Add to Cart"} selectedVariation={productState.selectedVariation} /></div>
          </div>
          {/* <ul className="offer-panel">
            {[1, 2, 3].map((_, index) => (
              <li key={index}>
                <span className="offer-icon">
                  <RiDiscountPercentFill />
                </span>{" "}
                {t("LimitedTimeOffer")}: {productState?.product?.discount}% off
              </li>
            ))}
          </ul> */}
        </div>
      </div>
    </div>
  );
};

export default ProductBox2;
