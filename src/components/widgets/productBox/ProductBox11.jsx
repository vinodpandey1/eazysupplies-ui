import OptimizedImage from "@/components/widgets/OptimizedImage";
import SettingContext from "@/context/settingContext";
import Link from "next/link";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import CartButton from "./widgets/CartButton";
import ProductBoxVariantAttribute from "./widgets/ProductBoxVariantAttributes";
import ProductHoverButton from "./widgets/ProductHoverButton";
import BrandBadge from "@/components/widgets/BrandBadge";

const getProductThumbnail = (product) => {
  if (product?.product_thumbnail?.original_url) return product.product_thumbnail;

  const [firstImage] = product?.productImage?.split(",") || [];
  if (!firstImage?.trim()) return { original_url: "/assets/images/placeholder/product.png" };

  const fileUrl = new URL(process.env.NEXT_PUBLIC_FILE_API_URL || "https://api.eazysupplies.com/api/file");
  fileUrl.searchParams.set("file", firstImage.trim());
  return { original_url: fileUrl.toString() };
};

const ProductBox11 = ({ productState, setProductState, listView = false }) => {
  const { convertCurrency } = useContext(SettingContext);
  const { t } = useTranslation("common");
  const product = productState?.product;
  const selectedVariation = productState?.selectedVariation;
  const productPath = product?.slug || product?.id;
  const normalizedProduct = product ? { ...product, slug: productPath } : product;
  const thumbnail = selectedVariation?.variation_image || getProductThumbnail(product);
  const displayPrice = selectedVariation?.sale_price ?? selectedVariation?.price ?? product?.sale_price ?? product?.price;

  return (
    <>
      <div className={`basic-product theme-product-10 ${productState?.selectedVariation ? (productState?.selectedVariation.stock_status === "out_of_stock" || !productState?.selectedVariation.status ? "sold-out" : "") : productState?.product?.stock_status === "out_of_stock" ? "sold-out" : ""}`}>
        <div className="img-wrapper">
          <div className="zoom">
            <Link href={`/product/${normalizedProduct?.slug}`}>
              <OptimizedImage src={thumbnail?.original_url} className="img-fluid bg-img" alt={normalizedProduct?.name} loading="lazy" />
            </Link>
          </div>
          <CartButton productState={productState} selectedVariation={productState.selectedVariation} text="Add to cart" classes="addto-cart-bottom" />
          <div className="cart-info">
            <ProductHoverButton productstate={productState?.product} />
          </div>
        </div>
        <div className="product-detail">
          {productState?.product?.brand && (
            <BrandBadge brand={productState.product.brand} compact className="mb-2" />
          )}

          <Link href={`/product/${productPath}`} className="product-title product-title-highlight">
            <h6>{productState?.selectedVariation ? productState?.selectedVariation.name : productState?.product?.name}</h6>
          </Link>

          {listView && product?.description && (
            <p className="list-product-description">
              {product.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 220)}
              {product.description.replace(/<[^>]*>/g, " ").trim().length > 220 ? "…" : ""}
            </p>
          )}

          <h4 className="price">
            {displayPrice != null ? convertCurrency(displayPrice) : null}
            {Number(product?.mrp) > Number(displayPrice) && <del className="ms-2">{convertCurrency(product.mrp)}</del>}
            {productState?.selectedVariation ? (
              productState?.selectedVariation.discount ? (
                <>
                  {productState?.selectedVariation?.price != productState?.selectedVariation?.sale_price || (productState?.product?.price != productState?.product?.sale_price && <del>{convertCurrency(productState?.product?.price)}</del>)}
                  <span className="discounted-price">
                    {productState?.selectedVariation.discount}% {t("Off")}
                  </span>
                </> 
              ) : null
            ) : productState?.product?.discount ? (
              <>
                {productState?.selectedVariation?.price != productState?.selectedVariation?.sale_price || (productState?.product?.price != productState?.product?.sale_price && <del>{convertCurrency(productState?.product?.price)}</del>)}
                <span className="discounted-price">
                  {productState?.product?.discount}% {t("Off")}
                </span>
              </>
            ) : null}
          </h4>

          <ProductBoxVariantAttribute productBox11={true} productState={productState} setProductState={setProductState} showVariableType={["dropdown"]} />
        </div>
      </div>
    </>
  );
};

export default ProductBox11;
