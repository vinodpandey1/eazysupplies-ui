import ProductBox from "@/components/widgets/productBox";
import WrapperComponent from "@/components/widgets/WrapperComponent";
import ProductIdsContext from "@/context/productIdsContext";
import request from "@/utils/axiosUtils";
import { ProductAPI } from "@/utils/axiosUtils/API";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Col, Row } from "reactstrap";

const normalizeRelatedIds = (value) => {
  if (Array.isArray(value)) return value.map(Number).filter(Number.isFinite);
  if (typeof value === "string") return value.split(",").map((id) => Number(id.trim())).filter(Number.isFinite);
  if (Number.isFinite(Number(value))) return [Number(value)];
  return [];
};

const RelatedProduct = ({ productState, customContainerClass }) => {
  const { t } = useTranslation("common");
  const { filteredProduct } = useContext(ProductIdsContext);
  const product = productState?.product;
  const relatedIds = useMemo(() => normalizeRelatedIds(product?.related_products), [product?.related_products]);

  const { data: categoryProducts } = useFetchQuery(
    ["pdp-related-products", product?.id, product?.categoryId],
    () => request({
      url: ProductAPI,
      params: { status: 1, category_ids: product?.categoryId, paginate: 8 },
    }),
    {
      enabled: Boolean(product?.id && product?.categoryId && relatedIds.length === 0),
      refetchOnWindowFocus: false,
      select: (response) => response?.data?.data || [],
    },
  );

  const { data: brandProducts } = useFetchQuery(
    ["pdp-related-brand-products", product?.id, product?.brandId],
    () => request({
      url: ProductAPI,
      params: { status: 1, brand_ids: product?.brandId, paginate: 8 },
    }),
    {
      enabled: Boolean(product?.id && product?.brandId && relatedIds.length === 0),
      refetchOnWindowFocus: false,
      select: (response) => response?.data?.data || [],
    },
  );

  const { data: generalProducts } = useFetchQuery(
    ["pdp-related-general-products", product?.id],
    () => request({ url: ProductAPI, params: { status: 1, paginate: 8 } }),
    {
      enabled: Boolean(product?.id && relatedIds.length === 0),
      refetchOnWindowFocus: false,
      select: (response) => response?.data?.data || [],
    },
  );

  const relatedProducts = useMemo(() => {
    const products = relatedIds.length
      ? filteredProduct?.filter((item) => relatedIds.includes(Number(item?.id))) || []
      : [...(categoryProducts || []), ...(brandProducts || []), ...(generalProducts || [])];

    const seen = new Set();
    return products
      .filter((item) => item?.id !== product?.id && !seen.has(item?.id) && seen.add(item?.id))
      .slice(0, 4);
  }, [brandProducts, categoryProducts, filteredProduct, generalProducts, product?.id, relatedIds]);

  if (!relatedProducts.length) return null;

  return (
    <WrapperComponent
      classes={{
        sectionClass: "related-products-section pt-0 section-b-space m-0",
        fluidClass: customContainerClass ? customContainerClass : "",
      }}
      noRowCol={true}
    >
      <div className="product-related">
        <h2>{t("RelatedProducts")}</h2>
      </div>
      <Row className="row-cols-lg-4 row-cols-sm-2 row-cols-1 g-4">
        {relatedProducts.map((relatedProduct) => (
          <Col key={relatedProduct.id}>
            <ProductBox product={relatedProduct} style="vertical" />
          </Col>
        ))}
      </Row>
    </WrapperComponent>
  );
};

export default RelatedProduct;
