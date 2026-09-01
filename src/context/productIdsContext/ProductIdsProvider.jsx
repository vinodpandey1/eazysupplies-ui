import request from "@/utils/axiosUtils";
import { ProductAPI } from "@/utils/axiosUtils/API";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import { useEffect, useState } from "react";
import ProductIdsContext from ".";

const ProductIdsProvider = (props) => {
  const [getProductIds, setGetProductIds] = useState({});
  const [filteredProduct, setFilteredProduct] = useState([]);
  const requestedIds = Array.isArray(getProductIds?.ids)
    ? getProductIds.ids
    : String(getProductIds?.ids || "").split(",").filter(Boolean);
  const requestSignature = JSON.stringify(getProductIds);
  const { data, refetch, isLoading, isRefetching } = useFetchQuery([ProductAPI, requestSignature], () => request({ url: ProductAPI, params: { ...getProductIds, status: 1, paginate: Math.max(requestedIds.length, 1) } }), {
    enabled: false,
    refetchOnWindowFocus: false,
    select: (data) => data?.data?.data,
  });

  useEffect(() => {
    Object.keys(getProductIds).length > 0 && refetch();
  }, [requestSignature, refetch]);

  useEffect(() => {
    if (data) {
      setFilteredProduct(data);
    }
  }, [data]);

  return <ProductIdsContext.Provider value={{ ...props, filteredProduct, setGetProductIds, isLoading, isRefetching }}>{props.children}</ProductIdsContext.Provider>;
};

export default ProductIdsProvider;
