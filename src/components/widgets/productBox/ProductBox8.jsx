import OptimizedImage from "@/components/widgets/OptimizedImage";
import Link from "next/link";
import React from "react";
import CartButton from "./widgets/CartButton";
import QuickViewButton from "./widgets/hoverButton/QuickViewButton";
import WishlistButton from "./widgets/hoverButton/WishlistButton";
import ProductRatingBox from "./widgets/ProductRatingBox";
import ProductPrice from "./widgets/ProductPrice";

const ProductBox8 = ({ productState }) => {
  return (
    <>
      <div className={`basic-product theme-product-7 ${productState?.product?.stock_status === "out_of_stock" ? "sold-out" : ""}`}>
        <div className="img-wrapper">
          <Link href={`/product/${productState?.product?.slug}`} className="img-fluid lazyload bg-img bg-top">
            <OptimizedImage src={productState?.product?.product_thumbnail?.original_url} className="img-fluid bg-img" alt="product-image" />
          </Link>
          <QuickViewButton productstate={productState?.product} className="quick-option" />
        </div>
        <div className="product-detail">
          <Link href={`/product/${productState?.product?.slug}`} className="product-title mb-2">
            {productState?.product?.name}
          </Link>
          <ProductPrice product={productState?.product} variation={productState?.selectedVariation} />
          <div className="rating-w-count mb-0">
            <div className="rating">
              <ProductRatingBox ratingCount={productState?.rating_count} />
            </div>
            <span>({productState?.product?.reviews_count})</span>
          </div>
          <div className="product-action">
            <WishlistButton productstate={productState?.product} />
            <CartButton productState={productState} selectedVariation={productState.selectedVariation} text="Add to cart" />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductBox8;
