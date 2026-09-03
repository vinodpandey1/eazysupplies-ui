import ProductRating from "@/components/widgets/productRating";
import SettingContext from "@/context/settingContext";
import { Href } from "@/utils/constants";
import TextLimit from "@/utils/customFunctions/TextLimit";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { getProductPricing } from "@/utils/pricing/productPricing";

const RightVariationModal = ({ cloneVariation }) => {
  const { convertCurrency } = useContext(SettingContext);
  const { t } = useTranslation("common");
  const pricing = getProductPricing(cloneVariation?.product, cloneVariation?.selectedVariation);
  return (
    <>
<h2 className="main-title text-break">{cloneVariation?.selectedVariation ? cloneVariation?.selectedVariation?.name : cloneVariation?.product?.name}</h2>
      <div className="product-rating">
        <ProductRating totalRating={cloneVariation?.product?.rating_count} />
        <span className="divider">|</span>
        <a href={Href}>
          {cloneVariation?.product?.reviews_count} {t("Reviews")}
        </a>
      </div>
      <div className="price-text">
        <h3>
          {convertCurrency(pricing.sellingPrice)}
          {pricing.hasOffer ? <del>{convertCurrency(pricing.regularPrice)}</del> : null}
          {pricing.hasOffer ? <span className="discounted-price">{pricing.discountPercentage}% {t("Off")}</span> : null}
        </h3>
        <span>{t("InclusiveAllTheText")} </span>
      </div>
     <TextLimit classes="description-text text-break" value={cloneVariation?.product?.short_description} maxLength={200} tag={"p"} />
    </>
  );
};

export default RightVariationModal;
