import OptimizedImage from "@/components/widgets/OptimizedImage";
import SettingContext from "@/context/settingContext";
import Link from "next/link";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { RiDiscountPercentFill, RiStarSFill } from "react-icons/ri";
import { placeHolderImage } from "../Placeholder";
import CartButton from "./widgets/CartButton";
import WishlistButton from "./widgets/hoverButton/WishlistButton";
import ProductBoxVariantAttribute from "./widgets/ProductBoxVariantAttributes";
import ProductHoverButton from "./widgets/ProductHoverButton";

const getFirstOriginalUrl = (filesString, updatedAt) => {
  if (!filesString) return null;
  const [firstFile] = filesString.split(",");
  if (!firstFile) return null;
  const trimmedFile = firstFile.trim();
  const url = new URL(process.env.NEXT_PUBLIC_FILE_API_URL);
  url.searchParams.set("file", trimmedFile);
  if (updatedAt) {
    url.searchParams.set("v", updatedAt);
  }
  return url.toString();
};

const lowercase = (text) => {
  return typeof text === "string" ? text.toLowerCase() : "";
};

const ProductBox2 = ({ productState, setProductState }) => {
  const { t } = useTranslation("common");

  const originalUrl = getFirstOriginalUrl(
    productState?.product?.productImage,
    productState?.product?.updatedAt,
  );
  const { convertCurrency } = useContext(SettingContext);
  return (
    <div className={`basic-product theme-product-1 ${productState?.product?.stock_status === "out_of_stock" ? "sold-out" : ""}`}>
      <div className="overflow-hidden">
        <div className="img-wrapper">
          {productState?.product?.is_trending || productState?.product?.is_sale_enable || productState?.product?.is_featured ? (
            <div className={`ribbon ${productState?.product?.is_sale_enable ? "sale-tag" : productState?.product?.is_featured ? "featured-tag" : productState?.product?.is_trending ? "trending-tag" : ""}`}>
              <span>{productState?.product?.is_sale_enable ? "sale" : productState?.product?.is_featured ? "featured" : productState?.product?.is_trending ? "trending" : ""}</span>
            </div>
          ) : null}

          <Link href={`/product/${productState?.product?.id}`}>
            <OptimizedImage src={originalUrl ? originalUrl : placeHolderImage} className="img-fluid bg-img" alt={productState?.product?.name} />
          </Link>
          <div className="rating-label">
            <RiStarSFill />
            <span>{productState?.product?.reviews_count}</span>
          </div>
          <div className="cart-info">
            {/* <WishlistButton customAnchor={true} productstate={productState?.product} /> */}
            <CartButton productState={productState} selectedVariation={productState.selectedVariation} />
            {/* <ProductHoverButton productstate={productState?.product} actionsToHide={"wishlist"} /> */}
          </div>
        </div>
        <div className="product-detail">
          <div>
            <div className="brand-w-color">
              <a className="product-title" href={`/product/${productState?.product?.id}`}>
                {productState?.product?.name}
              </a>
              <div className="color-panel">
                <ProductBoxVariantAttribute showVariableType={["color", "image"]} productState={productState} setProductState={setProductState} />
              </div>
            </div>
            <a href={`/product/${productState?.product?.id}`}>
              <h6>{ productState?.product?.brand?.name}</h6>
            </a>
            <h4 className="price">
              {convertCurrency(productState?.product?.price)}
              {productState?.product?.skuType ? ` / ${lowercase(productState.product.skuType)}` : ""}
              {/* {productState?.selectedVariation ? convertCurrency(productState?.selectedVariation.sale_price) : convertCurrency(productState?.product?.sale_price)} Adjust currencySymbol based on your implementation
              {(productState?.selectedVariation ? productState?.selectedVariation.discount : productState?.product?.discount) ? (
                <>
                  {productState?.selectedVariation?.price != productState?.selectedVariation?.sale_price || (productState?.product?.price != productState?.product?.sale_price && <del>{convertCurrency(productState?.product?.price)}</del>)}
                  <span className="discounted-price">{productState?.selectedVariation ? productState?.selectedVariation.discount : productState?.product?.discount}% Off</span>
                </>
              ) : null} */}
            </h4>
            <div className="price"><CartButton productState={productState} text={"Add to Cart"} selectedVariation={productState.selectedVariation} /></div>
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
