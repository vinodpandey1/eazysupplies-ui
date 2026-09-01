import SettingContext from "@/context/settingContext";
import Link from "next/link";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { RiStarSFill } from "react-icons/ri";
import CartButton from "./widgets/CartButton";
import ImageVariant from "./widgets/ImageVariant";
import ProductBoxVariantAttribute from "./widgets/ProductBoxVariantAttributes";
import ProductHoverButton from "./widgets/ProductHoverButton";
import BrandBadge from "@/components/widgets/BrandBadge";
import { getProductPricing, getUnitLabel } from "@/utils/pricing/productPricing";

const ProductBox1 = ({ productState, setProductState }) => {
  const { convertCurrency } = useContext(SettingContext);
  const { t } = useTranslation("common");
  const pricing = getProductPricing(productState?.product, productState?.selectedVariation);
  const unitLabel = getUnitLabel(productState?.product);

  return (
    <div className={`basic-product ${productState?.product?.stock_status === "out_of_stock" ? "sold-out" : ""}`}>
      <div className="img-wrapper">
        <ImageVariant thumbnail={productState?.selectedVariation?.variation_image ? productState?.selectedVariation?.variation_image : productState?.product?.product_thumbnail} gallery_images={productState?.product?.product_galleries} product={productState?.product} width={750} height={750} />

        {Number(productState?.product?.reviews_count) > 0 && (
          <div className="rating-label">
            <RiStarSFill />
            <span>{productState.product.reviews_count}</span>
          </div>
        )}

        <div className="cart-info">
          <CartButton classes={"addto-cart-bottom d-flex justify-content-center align-items-center w-100"} productState={productState} selectedVariation={productState?.selectedVariation} text="Add to Cart" />
          <ProductHoverButton productstate={productState?.product} />
        </div>

        <ul className="trending-label">
          {productState?.product?.stock_status === "out_of_stock" ? <li className="out_of_stock">{t("SoldOut")}</li> : null}
          {productState?.product?.is_sale_enable ? <li>{t("Sale")}</li> : null}
          {productState?.product?.is_featured ? <li>{t("Featured")}</li> : null}
          {productState?.product?.is_trending ? <li>{t("Trending")}</li> : null}
        </ul>
      </div>

      <div className="product-detail">
        {productState?.product?.brand && (
          <BrandBadge brand={productState.product.brand} compact className="mb-2" />
        )}

        <Link href={`/product/${productState?.product?.slug}`}>
          <h6>{productState?.selectedVariation ? productState?.selectedVariation?.name : productState?.product?.name}</h6>
        </Link>

        <h4 className="price product-price-display">
          <span className="selling-price">{convertCurrency(pricing.sellingPrice)}</span>
          {unitLabel && <span className="unit-label"> {unitLabel}</span>}
          {pricing.hasOffer && <del className="regular-price">{convertCurrency(pricing.regularPrice)}</del>}
          {pricing.hasOffer && <span className="discounted-price">{pricing.discountPercentage}% {t("Off")}</span>}
        </h4>

        <ProductBoxVariantAttribute setProductState={setProductState} productState={productState} showVariableType={["color", "rectangle", "circle", "radio", "dropdown", "image"]} />
      </div>
    </div>
  );
};

export default ProductBox1;
