import OptimizedImage from "@/components/widgets/OptimizedImage";
import Link from "next/link";
import React from "react";
import ProductRating from "../productRating";
import CartButton from "./widgets/CartButton";
import ProductBoxVariantAttribute from "./widgets/ProductBoxVariantAttributes";
import ProductHoverButton from "./widgets/ProductHoverButton";
import ProductPrice from "./widgets/ProductPrice";

const ProductBox12 = ({ productState, setProductState }) => {
  return (
    <>
      <div className="basic-product theme-product-11">
        <div className="img-wrapper">
          <Link href={`/product/${productState?.product?.slug}`}>
            <OptimizedImage src={productState?.selectedVariation?.variation_image ? productState?.selectedVariation.variation_image.original_url : productState?.product?.product_thumbnail?.original_url} className="img-fluid" alt={productState?.product?.name} />
          </Link>
          <div className="cart-info">
            <ProductHoverButton productstate={productState?.product} />
          </div>
          {productState?.product?.is_trending || productState?.product?.is_sale_enable || productState?.product?.is_featured ? <label className="trending-label-product11 ">{productState?.product?.is_sale_enable ? "Sale" : productState?.product?.is_featured ? "Featured" : productState?.product?.is_trending ? "Trending" : ""}</label> : null}
        </div>
        <div className="product-detail">
          {productState?.product?.brand && (
            <Link href={`/brand/${productState?.product?.brand?.slug}`} className="product-title">
              {productState?.product?.brand?.name}
            </Link>
          )}
          <h6>{productState?.product?.name}</h6>
          <ProductPrice product={productState?.product} variation={productState?.selectedVariation} />
          <div className="rating-w-count mb-0 mt-2">
            <ProductRating totalRating={productState?.product?.rating_count || 0} />
            <span>({productState?.product?.reviews_count})</span>
          </div>
        </div>
        <div className="abs-product">
          <div className="product-detail mt-0">
            {productState?.product?.brand && (
              <Link href={`/brand/${productState?.product?.brand.slug}`} className="product-title mb-2">
                {productState?.product?.brand.name}
              </Link>
            )}
            <ProductPrice product={productState?.product} variation={productState?.selectedVariation} />
          </div>
          <ProductBoxVariantAttribute productState={productState} setProductState={setProductState} showVariableType={["color", "rectangle", "circle", "radio", "dropdown", "image"]} />
          <CartButton productState={productState} selectedVariation={productState?.selectedVariation} text="Add To Cart" iconClass="" classes="add-cart-btn" />
        </div>
      </div>
    </>
  );
};

export default ProductBox12;
