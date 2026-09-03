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
    <h4 className={`${className} product-price-display`}>
      <span className="selling-price">{convertCurrency(pricing.sellingPrice)}</span>
      {unitLabel && <span className="unit-label"> {unitLabel}</span>}
      {pricing.hasOffer && <del className="regular-price">{convertCurrency(pricing.regularPrice)}</del>}
      {pricing.hasOffer && (
        <span className="discounted-price">
          {pricing.discountPercentage}% {t("Off")}
        </span>
      )}
    </h4>
  );
};

export default ProductPrice;
