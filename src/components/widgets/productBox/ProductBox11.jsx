import OptimizedImage from "@/components/widgets/OptimizedImage";
import Link from "next/link";
import React from "react";
import CartButton from "./widgets/CartButton";
import ProductBoxVariantAttribute from "./widgets/ProductBoxVariantAttributes";
import ProductHoverButton from "./widgets/ProductHoverButton";
import BrandBadge from "@/components/widgets/BrandBadge";
import ProductPrice from "./widgets/ProductPrice";

const getProductThumbnail = (product) => {
  if (product?.product_thumbnail?.original_url) return product.product_thumbnail;

  const [firstImage] = product?.productImage?.split(",") || [];
  if (!firstImage?.trim()) return { original_url: "/assets/images/placeholder/product.png" };

  const fileUrl = new URL(process.env.NEXT_PUBLIC_FILE_API_URL || "https://api.eazysupplies.com/api/file");
  fileUrl.searchParams.set("file", firstImage.trim());
  return { original_url: fileUrl.toString() };
};

const ProductBox11 = ({ productState, setProductState, listView = false }) => {
  const product = productState?.product;
  const selectedVariation = productState?.selectedVariation;
  const productPath = product?.slug || product?.id;
  const normalizedProduct = product ? { ...product, slug: productPath } : product;
  const thumbnail = selectedVariation?.variation_image || getProductThumbnail(product);

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

          <ProductPrice product={product} variation={selectedVariation} />

          <ProductBoxVariantAttribute productBox11={true} productState={productState} setProductState={setProductState} showVariableType={["dropdown"]} />
        </div>
      </div>
    </>
  );
};

export default ProductBox11;
