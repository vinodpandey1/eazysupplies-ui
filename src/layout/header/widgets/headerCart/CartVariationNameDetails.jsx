import SettingContext from "@/context/settingContext";
import Link from "next/link";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { getProductPricing } from "@/utils/pricing/productPricing";

const CartVariationNameDetails = ({ cloneVariation }) => {
  const { t } = useTranslation("common");
  const { convertCurrency } = useContext(SettingContext);
  const pricing = getProductPricing(
    cloneVariation?.product,
    cloneVariation?.selectedVariation || cloneVariation?.variation,
  );
  return (
    <div className="product-right product-page-details variation-title">
      <h2 className="main-title">
        <Link href={`/product/${cloneVariation?.product?.slug}`}> {cloneVariation?.variation?.name ?? cloneVariation?.product?.name} </Link>
      </h2>
      <h3 className="price-detail">
        {convertCurrency(pricing.sellingPrice)}
        {pricing.hasOffer ? <del>{convertCurrency(pricing.regularPrice)}</del> : null}
        {pricing.hasOffer ? <span>{pricing.discountPercentage}% {t("off")}</span> : null}
      </h3>
    </div>
  );
};

export default CartVariationNameDetails;
