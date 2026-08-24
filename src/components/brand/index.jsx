"use client";
import Loader from "@/layout/loader";
import request from "@/utils/axiosUtils";
import { BrandAPI } from "@/utils/axiosUtils/API";
import Breadcrumbs from "@/utils/commonComponents/breadcrumb";
import { useCustomSearchParams } from "@/utils/hooks/useCustomSearchParams";
import useFetchQuery from "@/utils/hooks/useFetchQuery";;
import BrandLogo from "@/components/widgets/BrandLogo";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import WrapperComponent from "../widgets/WrapperComponent";
import BrandCollection from "./brandCollection";

const BrandContainer = ({ params }) => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [filter, setFilter] = useState({ category: [], price: [], attribute: [], rating: [], sortBy: "", field: "" });
  const [category, attribute, price, rating, sortBy, field, paginate, layout] = useCustomSearchParams(["category", "attribute", "price", "rating", "sortBy", "field","paginate", "layout"]);
  const { data: Brand, isLoading } = useFetchQuery(
    [BrandAPI, params],
    () => request({ url: BrandAPI }, router),
    {
      enabled: !!params,
      refetchOnWindowFocus: false,
      select: (res) => res?.data?.data?.find((brand) => brand.slug === params),
    }
  );

  useEffect(() => {
    setFilter((prev) => {
      return {
        ...prev,
        category: category ? category?.category?.split(",") : [],
        attribute: attribute ? attribute?.attribute?.split(",") : [],
        price: price ? price?.price?.split(",") : [],
        rating: rating ? rating?.rating?.split(",") : [],
        sortBy: sortBy ? sortBy?.sortBy : "",
        field: field ? field?.field : "",
        paginate: paginate?.paginate? paginate?.paginate : 12,
      };
    });
  }, [category, attribute, price, rating, sortBy, field]);

  if (isLoading) return <Loader />;
  return (
    <>
      <Breadcrumbs title={`Brand : ${params}`} subNavigation={[{ name: params }]} />
      <WrapperComponent classes={{ sectionClass: "brand-section", fluidClass: "container" }} noRowCol={true}>
        {Brand && (
          <div className="brand-box d-inline-flex align-items-center gap-3 rounded border bg-white px-4 py-3">
            <span className="d-inline-flex align-items-center justify-content-center rounded border bg-white" style={{ width: 64, height: 64, overflow: "hidden" }}>
              <BrandLogo brand={Brand} width={54} height={54} />
            </span>
            <h3 className="mb-0 fw-semibold">{Brand.name}</h3>
          </div>
        )}
      </WrapperComponent>
      <WrapperComponent classes={{ sectionClass: "section-b-space brand-product-box-section collection-wrapper", fluidClass: "container" }} customCol={true}>
        <BrandCollection filter={filter} setFilter={setFilter} initialGrid={4} noSidebar={true} />
      </WrapperComponent>
    </>
  );
};

export default BrandContainer;
