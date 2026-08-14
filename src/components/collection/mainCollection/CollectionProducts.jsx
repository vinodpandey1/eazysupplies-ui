import NoDataFound from "@/components/widgets/NoDataFound";
import ProductBox from "@/components/widgets/productBox";
import ProductSkeleton from "@/components/widgets/skeletonLoader/ProductSkeleton";
import ThemeOptionContext from "@/context/themeOptionsContext";
import { ProductAPI } from "@/utils/axiosUtils/API";
import React, { useContext, useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import ListProductBox from "./ListProductBox";
import axios from "axios";

const CollectionProducts = ({ filter, grid, infiniteScroll, categorySlug }) => {
  const { themeOption } = useContext(ThemeOptionContext);
  const [adjustGrid, setAdjustGrid] = useState("col-6 col-lg-4");
  const [products, setProducts] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const categoryKey = filter?.category?.join(",") || "";
  const brandKey = filter?.brand?.join(",") || "";

  useEffect(() => {
    const controller = new AbortController();
    setIsProductsLoading(true);
    setProducts([]);

    axios
      .get(ProductAPI, {
        params: {
          status: 1,
          page: 1,
          paginate: filter?.paginate || 12,
          category_ids: categoryKey || undefined,
          brand_ids: brandKey || undefined,
          sort: filter?.sortBy || "asc",
          field: filter?.field || "createdAt",
        },
        signal: controller.signal,
        headers: { "Cache-Control": "no-cache" },
      })
      .then((response) => setProducts(response.data?.data || []))
      .catch((error) => {
        if (error?.code !== "ERR_CANCELED") {
          console.error("Unable to load filtered products", error);
          setProducts([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsProductsLoading(false);
      });

    return () => controller.abort();
  }, [categoryKey, brandKey, filter?.paginate, filter?.sortBy, filter?.field]);

  useEffect(() => {
    if (grid == 2) {
      setAdjustGrid("col-6");
    } else if (grid == 3) {
      setAdjustGrid("col-xl-4 col-lg-6 col-md-4 col-6");
    } else if (grid == 4) {
      setAdjustGrid("col-xl-3 col-lg-4 col-md-6 col-6");
    } else if (grid == "list") {
      setAdjustGrid("col-6 col-sm-12");
    }
  }, [grid]);

  return (
    <>
      {isProductsLoading ? (
        <Row className="g-xl-4 g-lg-3 g-sm-4 g-3">
          {new Array(12).fill(null).map((_, i) => (
            <Col className={adjustGrid} key={i}>
              <ProductSkeleton />
            </Col>
          ))}
        </Row>
      ) : products.length > 0 ? (
        <div className={`product-wrapper-grid ${infiniteScroll ? "product-load-more" : ""} ${grid == "list" ? "list-view" : ""} ${themeOption?.product?.full_border ? "full_border" : ""} ${themeOption?.product?.image_bg ? "product_img_bg" : ""} ${themeOption?.product?.product_box_bg ? "full_bg" : ""} ${themeOption?.product?.product_box_border ? "product_border" : ""}`}>
          <Row className="g-xl-4 g-lg-3 g-sm-4 g-3">
            {products.map((product) => (
              <Col className={adjustGrid} key={product.id}>
                {grid == "list" ? <ListProductBox product={product} /> : <ProductBox product={product} style="vertical" />}
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <NoDataFound customClass="no-data-added " title="NoProductFound" description="Please check if you have misspelt something or try searching with other way." height="345" width="345" imageUrl={`/assets/svg/empty-items.svg`} />
      )}


      {/* {(!infiniteScroll && fetchStatus != "idle") || isLoading ? (
        <Row className="g-xl-4 g-lg-3 g-sm-4 g-3">
          {new Array(40).fill(null).map((_, i) => (
            <Col className={adjustGrid} key={i}>
              <ProductSkeleton />
            </Col>
          ))}
        </Row>
      ) : data?.pages?.length > 0 && data.pages[data?.pages?.length - 1]?.data?.data?.length ? (
        <div className={`product-wrapper-grid ${infiniteScroll ? "product-load-more" : ""} ${grid == "list" ? "list-view" : ""} ${themeOption?.product?.full_border ? "full_border" : ""} ${themeOption?.product?.image_bg ? "product_img_bg" : ""} ${themeOption?.product?.product_box_bg ? "full_bg" : ""} ${themeOption?.product?.product_box_border ? "product_border" : ""}`}>
          {!infiniteScroll ? (
            <Row className="g-xl-4 g-lg-3 g-sm-4 g-3">
              {data?.pages[data.pages.length - 1]?.data?.data?.map((product, i) => (
                <Col className={adjustGrid} key={i}>
                  {grid == "list" ? <ListProductBox product={product} /> : <ProductBox product={product} style="vertical" />}
                </Col>
              ))}
            </Row>
          ) : (
            <Row className="g-xl-4 g-lg-3 g-sm-4 g-3">
              {infiniteScrollData?.map((product, i) => (
                <React.Fragment key={i}>
                  {product?.map((item, index) => (
                    <Col className={adjustGrid} key={index}>
                      <ProductBox product={item} style="vertical" />
                    </Col>
                  ))}
                </React.Fragment>
              ))}
            </Row>
          )}
        </div>
      ) : (
        <NoDataFound customClass="no-data-added " title="NoProductFound" description="Please check if you have misspelt something or try searching with other way." height="345" width="345" imageUrl={`/assets/svg/empty-items.svg`} />
      )} */}
    </>
  );
};

export default CollectionProducts;
