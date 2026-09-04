import OptimizedImage from "@/components/widgets/OptimizedImage";
import Link from "next/link";
import React from "react";
import CartButton from "./widgets/CartButton";
import ProductHoverButton from "./widgets/ProductHoverButton";
import ProductRatingBox from "./widgets/ProductRatingBox";
import OfferTimer from "@/components/productDetails/common/OfferTimer";
import ProductPrice from "./widgets/ProductPrice";

const ProductBox6 = ({ productState }) => {
  return (
    <>
      <div className="basic-product theme-product-5">
        <div className="img-wrapper">
          {productState?.product?.sale_starts_at && productState?.product?.sale_expired_at && <div className="d-none d-sm-flex"><OfferTimer productState={productState} noHeading /></div>}
          <Link href={`/product/${productState?.product?.slug}`}>
            <OptimizedImage src={productState?.selectedVariation ? productState?.selectedVariation.variation_image.original_url : productState?.product?.product_thumbnail?.original_url} className="img-fluid bg-img" alt={productState?.product?.name} />
          </Link>
          <div className="cart-info">
            <CartButton productState={productState} selectedVariation={productState.selectedVariation} />
            <ProductHoverButton productstate={productState.product} />
          </div>
          {productState?.product?.is_trending || productState?.product?.is_sale_enable || productState?.product?.is_featured ? <label className="rotate-label">{productState?.product?.is_sale_enable ? "sale" : productState?.product?.is_featured ? "featured" : productState?.product?.is_trending ? "trending" : ""}</label> : null}
        </div>
        <div className="product-detail">
          <div className="brand-w-color">
            {productState?.product?.brand && (
              <Link className="product-title" href={`/brand/${productState?.product?.brand.slug}`}>
                {productState?.product?.brand.name}
              </Link>
            )}
            <div className="rating-w-count">
              <div className="rating">
                <ProductRatingBox ratingCount={productState?.rating_count} />
              </div>
              <span>({productState?.product?.reviews_count})</span>
            </div>
          </div>
          <h6>{productState?.product?.name}</h6>
          <ProductPrice product={productState?.product} variation={productState?.selectedVariation} />
        </div>
      </div>
    </>
  );
};

export default ProductBox6;
