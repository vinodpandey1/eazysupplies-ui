const positiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const firstPositiveNumber = (...values) => {
  for (const value of values) {
    const number = positiveNumber(value);
    if (number !== null) return number;
  }
  return null;
};

const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null);

const normaliseBoolean = (value) => {
  if (value === true || value === 1 || value === "1" || value === "true") return true;
  if (value === false || value === 0 || value === "0" || value === "false") return false;
  return null;
};

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const percentageBetween = (regularPrice, sellingPrice) => (
  Math.round((((regularPrice - sellingPrice) / regularPrice) * 100 + Number.EPSILON) * 100) / 100
);

/**
 * Normalises storefront pricing without manufacturing an offer.
 *
 * Customer offers are calculated by the API. In that case the API's
 * regular_price/price is deliberately used as the strike price: `mrp` is a
 * separate catalogue concept and must not be combined with the customer
 * offer's percentage or amount. Legacy catalogue markdowns are still shown,
 * but their saving and percentage are always derived from the prices shown.
 */
export const getProductPricing = (product, variation) => {
  const baseProduct = product || {};
  const source = variation || baseProduct;
  const serverPricing = source?.pricing || baseProduct?.pricing || {};
  const offerFlag = normaliseBoolean(firstDefined(
    source?.has_offer,
    serverPricing?.has_offer,
    baseProduct?.has_offer,
  ));
  const customerDiscount = firstPositiveNumber(
    source?.customer_discount,
    serverPricing?.discount_percentage,
    baseProduct?.customer_discount,
  );
  const offerId = firstDefined(
    source?.applied_offer?.id,
    serverPricing?.offer_id,
    baseProduct?.applied_offer?.id,
  );
  const offerName = firstDefined(
    source?.applied_offer?.name,
    serverPricing?.offer_name,
    baseProduct?.applied_offer?.name,
  );
  const hasCustomerOfferSignal = offerFlag === false
    ? false
    : Boolean(offerFlag === true || customerDiscount || offerId || offerName);

  const apiRegularPrice = firstPositiveNumber(
    source?.regular_price,
    serverPricing?.regular_price,
    baseProduct?.regular_price,
    source?.price,
    baseProduct?.price,
  ) || 0;
  const apiEffectivePrice = firstPositiveNumber(
    source?.effective_price,
    serverPricing?.effective_price,
    baseProduct?.effective_price,
    source?.sale_price,
    baseProduct?.sale_price,
  );

  if (
    hasCustomerOfferSignal &&
    apiRegularPrice > 0 &&
    apiEffectivePrice &&
    apiEffectivePrice < apiRegularPrice
  ) {
    const discountAmount = roundMoney(apiRegularPrice - apiEffectivePrice);
    return {
      sellingPrice: apiEffectivePrice,
      regularPrice: apiRegularPrice,
      discountPercentage: percentageBetween(apiRegularPrice, apiEffectivePrice),
      discountAmount,
      hasOffer: true,
      isCustomerOffer: true,
      isCatalogMarkdown: false,
      offerType: "customer",
      offerId,
      offerName,
    };
  }

  // Catalogue markdowns pre-date customer offers. Show them only when the
  // strike/selling pair is real, and derive all labels from that same pair.
  const cataloguePrice = firstPositiveNumber(
    source?.price,
    baseProduct?.price,
    source?.regular_price,
    baseProduct?.regular_price,
  ) || 0;
  const catalogueSalePrice = firstPositiveNumber(source?.sale_price, baseProduct?.sale_price);
  const sellingPrice = catalogueSalePrice && catalogueSalePrice < cataloguePrice
    ? catalogueSalePrice
    : cataloguePrice;
  const mrp = firstPositiveNumber(source?.mrp, baseProduct?.mrp);
  const regularPrice = mrp && mrp > sellingPrice
    ? mrp
    : catalogueSalePrice && catalogueSalePrice < cataloguePrice
      ? cataloguePrice
      : null;
  const hasCatalogMarkdown = Boolean(regularPrice && sellingPrice > 0 && regularPrice > sellingPrice);

  return {
    sellingPrice,
    regularPrice: hasCatalogMarkdown ? regularPrice : null,
    discountPercentage: hasCatalogMarkdown ? percentageBetween(regularPrice, sellingPrice) : 0,
    discountAmount: hasCatalogMarkdown ? roundMoney(regularPrice - sellingPrice) : 0,
    hasOffer: hasCatalogMarkdown,
    isCustomerOffer: false,
    isCatalogMarkdown: hasCatalogMarkdown,
    offerType: hasCatalogMarkdown ? "catalogue" : null,
    offerId: null,
    offerName: null,
  };
};

export const getUnitLabel = (product) => {
  const unit = String(product?.skuType || "").trim();
  if (unit) {
    return `/ ${unit.charAt(0).toUpperCase()}${unit.slice(1).toLowerCase()}`;
  }

  // Older catalogue rows can have a blank skuType even though their pricing
  // clearly describes a case: more than one packaged unit plus separate case
  // and unit rates. Keep an explicit skuType authoritative (for example,
  // BOTTLE), and only infer Case when all of that structured data is present.
  const packageUnits = positiveNumber(product?.pkgUnit);
  const caseRate = positiveNumber(product?.caseRate);
  const unitRate = positiveNumber(product?.unitRate);
  if (packageUnits > 1 && caseRate && unitRate) return "/ Case";

  return "";
};
