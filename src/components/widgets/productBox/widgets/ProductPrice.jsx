import SettingContext from "@/context/settingContext";
import { getProductPricing, getUnitLabel } from "@/utils/pricing/productPricing";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

const ProductPrice = ({ product, variation, className = "price", showUnit = true }) => {
  const { convertCurrency } = useContext(SettingContext);
  const { t } = useTranslation("common");
  const pricing = getProductPricing(product, variation);
  const unitLabel = showUnit ? getUnitLabel(product) : "";

  if (!pricing.sellingPrice) return null;

  return (
    <h4
      className={`${className} product-price-display`}
      data-offer-type={pricing.offerType || "standard"}
      aria-label={`Price ${convertCurrency(pricing.sellingPrice)}${pricing.hasOffer ? `, was ${convertCurrency(pricing.regularPrice)}, ${pricing.discountPercentage}% off` : ""}`}
    >
      <span className="selling-price">{convertCurrency(pricing.sellingPrice)}</span>
      {unitLabel && <span className="unit-label"> {unitLabel}</span>}
      {pricing.hasOffer && (
        <del className="regular-price" aria-label={`Regular price ${convertCurrency(pricing.regularPrice)}`}>
          {convertCurrency(pricing.regularPrice)}
        </del>
      )}
      {pricing.hasOffer && (
        <span className="discounted-price" aria-label={`${pricing.discountPercentage}% ${t("Off")}`}>
          {pricing.discountPercentage}% {t("Off")}
        </span>
      )}
      {pricing.hasOffer && pricing.discountAmount > 0 && (
        <span className="discount-amount" aria-label={`${t("Save")} ${convertCurrency(pricing.discountAmount)}`}>
          {t("Save")} {convertCurrency(pricing.discountAmount)}
        </span>
      )}
    </h4>
  );
};

export default ProductPrice;
