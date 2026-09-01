import NoDataFound from "@/components/widgets/NoDataFound";
import ProductBox from "@/components/widgets/productBox";
import ProductSkeleton from "@/components/widgets/skeletonLoader/ProductSkeleton";
import WrapperComponent from "@/components/widgets/WrapperComponent";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Col, Row } from "reactstrap";

const normalize = (value) => String(value || "").trim().toLowerCase();

const getSearchScore = (product, query) => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return 1;

  const name = normalize(product?.name);
  const sku = normalize(product?.sku);
  const brand = normalize(product?.brand?.name);
  const category = normalize(product?.category?.name || product?.categories?.[0]?.name);
  const keywords = normalize(
    Array.isArray(product?.keywords)
      ? product.keywords.map((item) => item?.name || item).join(" ")
      : product?.keywords || product?.tags,
  );
  const searchableText = [name, sku, brand, category, keywords].filter(Boolean).join(" ");
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  if (!terms.every((term) => searchableText.includes(term))) return 0;
  if (name === normalizedQuery) return 100;
  if (sku === normalizedQuery) return 95;
  if (name.startsWith(normalizedQuery)) return 80;
  if (name.includes(normalizedQuery)) return 65;
  if (brand === normalizedQuery || category === normalizedQuery) return 55;
  if (brand.includes(normalizedQuery) || category.includes(normalizedQuery)) return 45;
  return 20;
};

const SearchedData = ({ data, fetchStatus }) => {
  const param = useSearchParams();
  const searchParam = param.get("search");
  const mainProducts = useMemo(() => {
    const products = Array.isArray(data) ? data : [];
    if (!searchParam?.trim()) return products.slice(0, 12);

    return products
      .map((product) => ({ product, score: getSearchScore(product, searchParam) }))
      .filter((item) => item.score > 0)
      .sort((first, second) => second.score - first.score || String(first.product?.name || "").localeCompare(String(second.product?.name || "")))
      .map((item) => item.product);
  }, [data, searchParam]);

  return (
    <WrapperComponent classes={{ sectionClass: "section-b-space", fluidClass: "container" }} noRowCol={true}>
      {fetchStatus == "fetching" ? (
        <Row className="search-product g-4">
          {new Array(8).fill(null).map((_, i) => (
            <Col xl="3" lg="4" md="6" xs="6" key={i}>
              <ProductSkeleton />
            </Col>
          ))}
        </Row>
      ) : mainProducts?.length > 0 ? (
        <Row className="search-product g-4">
          {mainProducts?.map((product) => (
            <Col xl="3" lg="4" md="6" xs="6" key={product?.id}>
              <ProductBox product={product} style="vertical" />
            </Col>
          ))}
        </Row>
      ) : (
        <NoDataFound imageUrl={`/assets/svg/empty-items.svg`} customClass="collection-no-data no-data-added" title="productsNoFound" description="productsNoFoundDescription" height="300" width="300" u />
      )}
    </WrapperComponent>
  );
};

export default SearchedData;
