import { useContext } from "react";
import ProductBox1Rating from "@/Components/Widgets/ProductBox/ProductBox1/ProductBox1Rating";
import SettingContext from "@/context/settingContext";
import { useTranslation } from "react-i18next";
import { getProductPricing, getUnitLabel } from "@/utils/pricing/productPricing";

const ProductDetails = ({ productState }) => {
  const { t } = useTranslation("common");
  const { convertCurrency } = useContext(SettingContext);
  const pricing = getProductPricing(productState?.product, productState?.selectedVariation);
  const unitLabel = getUnitLabel(productState?.product);
  return (
    <>
      <h2 className="name">{productState?.selectedVariation?.name ?? productState?.product?.name}</h2>
      <div className="price-rating">
        <h3 className="theme-color price product-price-display">
          <span className="selling-price">{convertCurrency(pricing.sellingPrice)}</span>
          {unitLabel && <span className="unit-label"> {unitLabel}</span>}
          {pricing.hasOffer && <del className="regular-price text-content">{convertCurrency(pricing.regularPrice)}</del>}
          {pricing.hasOffer && (
            <span className="offer-top discounted-price">
              {pricing.discountPercentage}% {t("Off")}
            </span>
          )}
        </h3>
        <div className="product-rating custom-rate">
          <ProductBox1Rating totalRating={productState?.selectedVariation?.rating_count ?? productState?.product?.rating_count} />
          <span className="review">
            {productState?.selectedVariation?.reviews_count || productState?.product?.reviews_count || 0} {t("Review")}
          </span>
        </div>
      </div>
      <div className="product-contain">
        <p>{productState?.selectedVariation?.short_description ?? productState?.product?.short_description}</p>
      </div>
    </>
  );
};

export default ProductDetails;
