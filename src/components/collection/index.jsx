"use client";
import CategoryContext from "@/context/categoryContext";
import BrandContext from "@/context/brandContext";
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

const CollectionContain = () => {
  const [filter, setFilter] = useState({ category: [], brand: [], price: [], attribute: [], rating: [], sortBy: "a-z", field: "name", paginate: 25 });
  const { themeOption } = useContext(ThemeOptionContext);
  const [category, brand, attribute, price, rating, sortBy, field, layout, paginate, title] = useCustomSearchParams(["category", "brand", "attribute", "price", "rating", "sortBy", "field", "layout", "paginate", "title"]);
  const collectionLayout = layout?.layout ? layout?.layout : themeOption?.collection?.collection_layout;
  const searchParams = useSearchParams();
  const currentCollectionLink = `/collections${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const { categoryIsLoading } = useContext(CategoryContext);
  const { categoryData = [] } = useContext(CategoryContext);
  const { brandState = [] } = useContext(BrandContext);
  const categoryId = category?.category?.split(",")?.[0];
  const brandId = brand?.brand?.split(",")?.[0];
  const flattenCategories = (items = []) => items.flatMap((item) => [item, ...flattenCategories(item?.subcategories || [])]);
  const activeName = title?.title?.trim();
  const activeCategoryName = flattenCategories(categoryData).find((item) => String(item?.id) === String(categoryId))?.name || activeName;
  const activeBrandName = brandState.find((item) => String(item?.id) === String(brandId) || String(item?.slug) === String(brandId))?.name || activeName;

  const breadcrumbDetails = categoryId
    ? {
        title: activeCategoryName || `Category ${categoryId}`,
        items: [
          { name: "Category", categoryPopover: true, icon: "category" },
          { name: activeCategoryName || `Category ${categoryId}`, link: currentCollectionLink, icon: "category", current: true },
        ],
      }
    : brandId
      ? {
          title: activeBrandName || `Brand ${brandId}`,
          items: [
            { name: "Brand", icon: "brand" },
            { name: activeBrandName || `Brand ${brandId}`, link: currentCollectionLink, icon: "brand", current: true },
          ],
        }
      : {
          title: "All Products",
          items: [{ name: "All Products", link: "/collections", icon: "products", current: true }],
        };

  useEffect(() => {
    setFilter((prev) => {
      return {
        ...prev,
        paginate: paginate?.paginate ? Number(paginate.paginate) : 25,
        category: category ? category?.category?.split(",") : [],
        brand: brand ? brand?.brand?.split(",") : [],
        attribute: attribute ? attribute?.attribute?.split(",") : [],
        price: price ? price?.price?.split(",") : [],
        rating: rating ? rating?.rating?.split(",") : [],
        sortBy: sortBy ? sortBy?.sortBy : "a-z",
        field: field ? field?.field : "name",
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
    collection_2_grid: <CollectionLeftSidebar filter={filter} setFilter={setFilter} />,
    collection_3_grid: <CollectionLeftSidebar filter={filter} setFilter={setFilter} />,
    collection_4_grid: <CollectionLeftSidebar filter={filter} setFilter={setFilter} />,
    collection_5_grid: <CollectionLeftSidebar filter={filter} setFilter={setFilter} />,
    collection_list_view: <CollectionLeftSidebar filter={filter} setFilter={setFilter} />,
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
          {isCollectionMatch[collectionLayout] || <CollectionLeftSidebar filter={filter} setFilter={setFilter} />}
        </>
      )}
    </>
  );
};

export default CollectionContain;
