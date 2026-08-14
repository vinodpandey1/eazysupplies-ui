import CategoryContext from "@/context/categoryContext";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";
import { RiArrowRightSLine, RiFolder3Line, RiHome4Line, RiPriceTag3Line, RiShoppingBag3Line } from "react-icons/ri";

const breadcrumbIcons = {
  category: RiFolder3Line,
  brand: RiPriceTag3Line,
  products: RiShoppingBag3Line,
};

const Breadcrumbs = ({ mainHeading, subNavigation, subTitle, title }) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categoryData = [] } = useContext(CategoryContext) || {};
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);

  const openCategory = (category) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("layout", params.get("layout") || "collection_3_grid");
    params.set("category", String(category.id));
    params.set("title", category.name);
    params.delete("brand");
    setCategoryPopoverOpen(false);
    router.push(`/collections?${params.toString()}`);
  };

  const visibleCategories = categoryData.filter((category) => category?.name && category.name.toUpperCase() !== "DEFAULT");
  const itemContent = (result) => {
    const ItemIcon = breadcrumbIcons[result?.icon];
    return (
      <>
        {ItemIcon && <ItemIcon className="breadcrumb-icon" aria-hidden="true" />}
        <span>{t(result?.name?.replaceAll("-", " "))}</span>
      </>
    );
  };

  return (
    <div className="breadcrumb-section">
      <Container>
        <h2>{t(title?.replaceAll("-", " "))}</h2>
        <nav className="theme-breadcrumb">
          <Breadcrumb>
            <div className="breadcrumb-item active breadcrumb-home-item">
              <Link href="/" className="breadcrumb-link">
                <RiHome4Line className="breadcrumb-icon" aria-hidden="true" />
                <span>{t("Home")}</span>
              </Link>
            </div>
            {subNavigation?.map((result, i) => (
              <div key={i} className={`breadcrumb-item active ${result?.current ? "breadcrumb-current" : ""}`} aria-current={result?.current ? "page" : undefined}>
                <RiArrowRightSLine className="breadcrumb-separator" aria-hidden="true" />
                {result?.categoryPopover ? (
                  <Dropdown className="breadcrumb-category-dropdown" isOpen={categoryPopoverOpen} toggle={() => setCategoryPopoverOpen((open) => !open)}>
                    <DropdownToggle tag="button" color="link" className="breadcrumb-category-toggle p-0 border-0 text-uppercase">
                      {itemContent(result)}
                    </DropdownToggle>
                    <DropdownMenu style={{ maxHeight: "320px", minWidth: "280px", overflowY: "auto" }}>
                      <DropdownItem header>{t("Categories")}</DropdownItem>
                      {visibleCategories.map((category) => (
                        <DropdownItem key={category.id} toggle={false} active={String(category.id) === searchParams.get("category")} onClick={() => openCategory(category)}>
                          {category.name}
                        </DropdownItem>
                      ))}
                      {!visibleCategories.length && <DropdownItem disabled>{t("NoCategoryFound")}</DropdownItem>}
                    </DropdownMenu>
                  </Dropdown>
                ) : result?.current ? (
                  <span className="breadcrumb-label">{itemContent(result)}</span>
                ) : result?.link ? (
                  <Link href={result.link} className="breadcrumb-link">{itemContent(result)}</Link>
                ) : (
                  <span className="breadcrumb-label">{itemContent(result)}</span>
                )}
              </div>
            ))}
          </Breadcrumb>
        </nav>
      </Container>
    </div>
  );
};

export default Breadcrumbs;
