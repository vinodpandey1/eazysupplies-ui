const positiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

/**
 * Normalises storefront pricing without manufacturing an offer.
 *
 * The API currently uses `price` as the selling price and may optionally send
 * `sale_price`, `mrp`, and `discount`. A crossed-out value is only valid when
 * it is genuinely greater than the amount the customer will pay.
 */
export const getProductPricing = (product, variation) => {
  const source = variation || product || {};
  const productPrice = positiveNumber(product?.price);
  const sourcePrice = positiveNumber(source?.price) || productPrice || 0;
  const salePrice = positiveNumber(source?.sale_price ?? product?.sale_price);
  const mrp = positiveNumber(source?.mrp ?? product?.mrp);

  const sellingPrice = salePrice && salePrice < sourcePrice ? salePrice : sourcePrice;
  const regularCandidate = Math.max(sourcePrice || 0, mrp || 0);
  const regularPrice = regularCandidate > sellingPrice ? regularCandidate : null;
  const explicitDiscount = positiveNumber(source?.discount ?? product?.discount);
  const calculatedDiscount = regularPrice
    ? Math.round(((regularPrice - sellingPrice) / regularPrice) * 100)
    : 0;
  const discountPercentage = regularPrice
    ? Math.min(100, Math.round(explicitDiscount || calculatedDiscount))
    : 0;

  return {
    sellingPrice,
    regularPrice,
    discountPercentage,
    hasOffer: Boolean(regularPrice && discountPercentage > 0),
  };
};

export const getUnitLabel = (product) => {
  const unit = String(product?.skuType || "").trim();
  if (!unit) return "";
  return `/ ${unit.charAt(0).toUpperCase()}${unit.slice(1).toLowerCase()}`;
};

