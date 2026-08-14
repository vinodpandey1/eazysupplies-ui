"use client";
import CategoryContext from "@/context/categoryContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import Loader from "@/layout/loader";
import Breadcrumbs from "@/utils/commonComponents/breadcrumb";
import { useCustomSearchParams } from "@/utils/hooks/useCustomSearchParams";
import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CollectionBanner from "./collectionBanner";
import CollectionInfiniteScroll from "./collectionInfiniteScroll";
import CollectionLeftSidebar from "./collectionLeftSidebar";
import CollectionNoSidebar from "./collectionNoSidebar";
import CollectionOffCanvas from "./collectionOffcanvas";
import CollectionRightSidebar from "./collectionRightSidebar";
import CollectionSidebarPopUp from "./collectionSidebarPopUp";
import MainCollectionSlider from "./collectionSlider";
import LayoutSidebar from "./layoutSidebar";
import { BrandAPI, CategoryAPI } from "@/utils/axiosUtils/API";
import axios from "axios";

const CollectionContain = () => {
  const [filter, setFilter] = useState({ category: [], brand: [], price: [], attribute: [], rating: [], sortBy: "asc", field: "created_at" });
  const { themeOption } = useContext(ThemeOptionContext);
  const [category, brand, attribute, price, rating, sortBy, field, layout, paginate, title] = useCustomSearchParams(["category", "brand", "attribute", "price", "rating", "sortBy", "field", "layout", "paginate", "title"]);
  const collectionLayout = layout?.layout ? layout?.layout : themeOption?.collection?.collection_layout;
  const searchParams = useSearchParams();
  const currentCollectionLink = `/collections${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const { categoryIsLoading } = useContext(CategoryContext);
  const categoryId = category?.category?.split(",")?.[0];
  const brandId = brand?.brand?.split(",")?.[0];
  const activeName = title?.title?.trim();

  const breadcrumbDetails = categoryId
    ? {
        title: activeName || `Category ${categoryId}`,
        items: [
          { name: "Category", categoryPopover: true, icon: "category" },
          { name: activeName || `Category ${categoryId}`, link: currentCollectionLink, icon: "category", current: true },
        ],
      }
    : brandId
      ? {
          title: activeName || `Brand ${brandId}`,
          items: [
            { name: "Brand", icon: "brand" },
            { name: activeName || `Brand ${brandId}`, link: currentCollectionLink, icon: "brand", current: true },
          ],
        }
      : {
          title: "All Products",
          items: [{ name: "All Products", link: "/collections", icon: "products", current: true }],
        };

  useEffect(() => {
    axios.get(CategoryAPI).then((res) => {
      localStorage.setItem("categoryList", JSON.stringify(res.data?.data))
    }, (err) => {
      console.log(err)
    })

    axios.get(BrandAPI).then((res) => {
      localStorage.setItem("brandList", JSON.stringify(res.data?.data))
    }, (err) => {
      console.log(err)
    })
  }, [])


  useEffect(() => {
    setFilter((prev) => {
      return {
        ...prev,
        paginate: paginate?.paginate ? paginate?.paginate : 12,
        category: category ? category?.category?.split(",") : [],
        brand: brand ? brand?.brand?.split(",") : [],
        attribute: attribute ? attribute?.attribute?.split(",") : [],
        price: price ? price?.price?.split(",") : [],
        rating: rating ? rating?.rating?.split(",") : [],
        sortBy: sortBy ? sortBy?.sortBy : "asc",
        field: field ? field?.field : "created_at",
      };
    });
  }, [category, brand, attribute, price, rating, sortBy, field, paginate]);

  const isCollectionMatch = {
    collection_category_slider: <MainCollectionSlider filter={filter} setFilter={setFilter} />,
    collection_category_sidebar: <LayoutSidebar filter={filter} setFilter={setFilter} />,
    collection_banner: <CollectionBanner filter={filter} setFilter={setFilter} />,
    collection_top_filter: <CollectionOffCanvas filter={filter} setFilter={setFilter} />,
    collection_no_sidebar: <CollectionNoSidebar filter={filter} setFilter={setFilter} />,
    collection_left_sidebar: <CollectionLeftSidebar filter={filter} setFilter={setFilter} />,
    collection_right_sidebar: <CollectionRightSidebar filter={filter} setFilter={setFilter} />,
    collection_2_grid: <CollectionNoSidebar filter={filter} setFilter={setFilter} />,
    collection_3_grid: <CollectionOffCanvas filter={filter} setFilter={setFilter} />,
    collection_4_grid: <CollectionNoSidebar filter={filter} setFilter={setFilter} />,
    collection_5_grid: <CollectionNoSidebar filter={filter} setFilter={setFilter} />,
    collection_list_view: <CollectionNoSidebar filter={filter} setFilter={setFilter} />,
    collection_sidebar_popup: <CollectionSidebarPopUp filter={filter} setFilter={setFilter} />,
    collection_product_infinite_scroll: <CollectionInfiniteScroll filter={filter} setFilter={setFilter} />,
  };

  return (
    <>
      {categoryIsLoading ? (
        <Loader />
      ) : (
        <>
          <Breadcrumbs
            title={breadcrumbDetails.title}
            subNavigation={breadcrumbDetails.items}
          />
          {isCollectionMatch[collectionLayout]}
        </>
      )}
    </>
  );
};

export default CollectionContain;
