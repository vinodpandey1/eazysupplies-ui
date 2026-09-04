import NoDataFound from "@/components/widgets/NoDataFound";
import ProductBox from "@/components/widgets/productBox";
import ProductSkeleton from "@/components/widgets/skeletonLoader/ProductSkeleton";
import Pagination from "@/components/widgets/Pagination";
import ThemeOptionContext from "@/context/themeOptionsContext";
import request from "@/utils/axiosUtils";
import { ProductAPI } from "@/utils/axiosUtils/API";
import React, { useContext, useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import ListProductBox from "./ListProductBox";

const CollectionProducts = ({ filter, grid, infiniteScroll, categorySlug }) => {
  const { themeOption } = useContext(ThemeOptionContext);
  const [adjustGrid, setAdjustGrid] = useState("col-6 col-md-4");
  const [products, setProducts] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, total: 0, per_page: 25, last_page: 1 });
  const categoryKey = filter?.category?.join(",") || "";
  const brandKey = filter?.brand?.join(",") || "";

  useEffect(() => {
    setPage(1);
  }, [categoryKey, brandKey, filter?.paginate, filter?.sortBy, filter?.field]);

  useEffect(() => {
    const controller = new AbortController();
    setIsProductsLoading(true);
    setProducts([]);

    request({
        url: ProductAPI,
        method: "get",
        params: {
          status: 1,
          page,
          paginate: filter?.paginate || 25,
          category_ids: categoryKey || undefined,
          brand_ids: brandKey || undefined,
          sort: filter?.sortBy === "z-a" || filter?.sortBy === "high-low" ? "desc" : "asc",
          field: filter?.field === "price" || filter?.sortBy === "low-high" || filter?.sortBy === "high-low" ? "price" : "name",
          _request: Date.now(),
        },
        signal: controller.signal,
      })
      .then((response) => {
        const responseData = response.data || {};
        // Render the exact page returned by the API. Removing duplicates here made
        // the visible row count smaller than the API's `per_page`/`total` values
        // and caused items to disappear from a paginated catalogue.
        setProducts(Array.isArray(responseData.data) ? responseData.data : []);
        setPagination({
          current_page: Number(responseData.current_page) || page,
          total: Number(responseData.total) || 0,
          per_page: Number(responseData.per_page) || Number(filter?.paginate) || 25,
          last_page: Number(responseData.last_page) || 1,
        });
      })
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
  }, [categoryKey, brandKey, filter?.paginate, filter?.sortBy, filter?.field, page]);

  const changePage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.last_page || nextPage === page) return;
    setPage(nextPage);
    document.querySelector(".product-top-filter")?.scrollIntoView({ block: "start", behavior: "auto" });
  };

  useEffect(() => {
    if (grid == 2) {
      setAdjustGrid("col-12 col-sm-6");
    } else if (grid == 3) {
      setAdjustGrid("col-6 col-md-4");
    } else if (grid == 4) {
      setAdjustGrid("col-6 col-md-4 col-xl-3");
    } else if (grid == 5) {
      setAdjustGrid("col-6 col-md-4 col-lg-3 col-xxl-5th");
    } else if (grid == "list") {
      setAdjustGrid("col-12");
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

      {!isProductsLoading && products.length > 0 && pagination.last_page > 1 && (
        <nav className="custome-pagination mt-4" aria-label="Product pages">
          <Pagination
            current_page={pagination.current_page}
            total={pagination.total}
            per_page={pagination.per_page}
            setPage={changePage}
          />
        </nav>
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
