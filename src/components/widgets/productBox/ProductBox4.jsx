import OptimizedImage from "@/components/widgets/OptimizedImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import CartButton from "./widgets/CartButton";
import WishlistButton from "./widgets/hoverButton/WishlistButton";
import ProductHoverButton from "./widgets/ProductHoverButton";
import ProductRatingBox from "./widgets/ProductRatingBox";
import ProductPrice from "./widgets/ProductPrice";

const ProductBox4 = ({ productState }) => {
  const router = useRouter();
  return (
    <>
      <div className={`basic-product theme-product-3 ${productState?.product?.stock_status === "out_of_stock" ? "sold-out" : ""}`}>
        <div className="img-wrapper">
          {productState?.product?.discount && <div className="ribbon-round">{productState?.product?.discount}%</div>}
          <Link href={`/product/${productState?.product?.slug}`}>
            <OptimizedImage src={productState?.product?.product_thumbnail?.original_url} className="img-fluid bg-img" alt={productState?.product?.name} />
          </Link>
          <div className="cart-info">
            <WishlistButton productstate={productState?.product} classes="wishlist-icon" />
            <ProductHoverButton productstate={productState.product} actionsToHide={"wishlist"} />
          </div>
        </div>
        <div className="product-detail">
          <a className="product-title" onClick={() => router.push(`/product/${productState?.product?.slug}`)}>
            {productState?.product?.name}
          </a>
          <div className="rating-w-count">
            <div className="rating">
              <ProductRatingBox ratingCount={productState?.rating_count} />
            </div>
            <span>({productState?.product?.reviews_count})</span>
          </div>
          <ProductPrice product={productState?.product} variation={productState?.selectedVariation} />
          <div className="add-cart-button">
            <CartButton productState={productState} selectedVariation={productState.selectedVariation} classes="add-cart-btn" text="Add to cart" />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductBox4;
