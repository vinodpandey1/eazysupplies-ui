import OptimizedImage from "@/components/widgets/OptimizedImage";
import Link from "next/link";
import React from "react";
import CartButton from "./widgets/CartButton";
import CompareButton from "./widgets/hoverButton/CompareButton";
import QuickViewButton from "./widgets/hoverButton/QuickViewButton";
import WishlistButton from "./widgets/hoverButton/WishlistButton";
import ProductBoxVariantAttribute from "./widgets/ProductBoxVariantAttributes";
import ProductRatingBox from "./widgets/ProductRatingBox";
import ProductPrice from "./widgets/ProductPrice";

const ProductBox3 = ({ productState, setProductState }) => {
  return (
    <>
      <div className={`basic-product theme-product-2 ${productState?.product?.stock_status === "out_of_stock" ? "sold-out" : ""}`}>
        <div className="product-detail mt-0">
          <Link className="product-title" href={`/product/${productState?.product?.slug}`}>
            {productState?.selectedVariation ? productState?.selectedVariation.name : productState?.product?.name}
          </Link>
          <div className="rating">
            <ProductRatingBox ratingCount={productState?.rating_count} />
          </div>
          {productState?.product?.unit && (
            <ul className="details">
              <li>{productState?.product?.unit}</li>
            </ul>
          )}
          <div className="add-wish">
            <WishlistButton productstate={productState?.product} />
          </div>
        </div>
        <div className="img-wrapper">
          <Link href={`/product/${productState?.product?.slug}`}>
            <OptimizedImage src={productState?.selectedVariation?.variation_image ? productState?.selectedVariation.variation_image.original_url : productState?.product?.product_thumbnail?.original_url} className="img-fluid" alt={productState?.product?.name} />
          </Link>
          <div className="quick-view-part">
            <QuickViewButton productstate={productState?.product} />
          </div>
        </div>
        <div className="bottom-detail">
          <div>
            <div className="color-panel color-lg">
              <ProductBoxVariantAttribute productState={productState} setProductState={setProductState} showVariableType={["color"]} />
            </div>
            <ProductPrice product={productState?.product} variation={productState?.selectedVariation} />
          </div>
        </div>
        <ul className="cart-detail">
          <li>
            <CartButton productState={productState} selectedVariation={productState.selectedVariation} text="Add to cart" />
          </li>
          <li>
            <CompareButton productstate={productState?.product} text="Compare" />
          </li>
        </ul>
      </div>
    </>
  );
};

export default ProductBox3;
