import RatingBox from "@/components/collection/collectionSidebar/RatingBox";
import ImageLink from "@/components/themes/widgets/imageLink";
import request from "@/utils/axiosUtils";
import { ProductAPI } from "@/utils/axiosUtils/API";
import useFetchQuery from "@/utils/hooks/useFetchQuery";;
import Link from "next/link";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Media } from "reactstrap";
import ProductPrice from "@/components/widgets/productBox/widgets/ProductPrice";

const TrendingProduct = ({ productState }) => {
  const { t } = useTranslation("common");
  const categoryId = useMemo(() => {
    return productState?.product?.categories?.map((elem) => elem?.id);
  }, [productState?.product?.categories]);
  const { data: productData, refetch: productRefetch } = useFetchQuery([categoryId], () => request({ url: ProductAPI, params: { status: 1, trending: 1, category_ids: categoryId?.join() } }), {
    enabled: false,
    refetchOnWindowFocus: false,
    select: (data) => data.data.data,
  });
  useEffect(() => {
    categoryId?.length > 0 && productRefetch();
  }, [categoryId]);
  if (productData?.length == 0) return null;
  return (
    <div className="theme-card">
      <h5 className="title-border">{t("TrendingProducts")}</h5>
      <div className="offer-slider">
        {productData?.slice(0, 4)?.map((elem, i) => (
          <Media className="mb-2" key={i}>
            <ImageLink imgUrl={elem?.product_galleries[0]?.original_url} width={105} height={120} />
            <Media body>
              <RatingBox totalRating={elem?.rating_count ?? productState?.product?.rating_count} />
              <Link href={`/product/${elem?.slug}`}>
                <h6>{elem?.name}</h6>
              </Link>
              <ProductPrice product={elem} />
            </Media>
          </Media>
        ))}
      </div>
    </div>
  );
};

export default TrendingProduct;
