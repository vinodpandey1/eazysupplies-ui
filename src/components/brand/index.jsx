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
          <div className="brand-box d-flex flex-column align-items-center justify-content-center gap-3 rounded border bg-white p-4">
            <BrandLogo brand={Brand} width={240} height={110} />
            <h2 className="mb-0">{Brand.name}</h2>
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
