import { FilterSortData } from "@/data/CustomData";
import { useCustomSearchParams } from "@/utils/hooks/useCustomSearchParams";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";

const FilterSort = ({ filter, setFilter }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const [attribute, price, category, layout, paginate] = useCustomSearchParams(["attribute", "price", "category", "layout", "paginate"]);
  const { t } = useTranslation("common");
  const router = useRouter();
  const pathname = usePathname();
  const handleSort = (data) => {
    const field = data.value === "low-high" || data.value === "high-low" ? "price" : "name";

    setFilter((prev) => {
      return {
        ...prev,
        sortBy: data.value,
        field,
      };
    });

    const queryParams = new URLSearchParams({
      ...attribute,
      ...price,
      ...category,
      ...layout,
      ...paginate,
      sortBy: data.value,
      field,
    }).toString();
    router.push(`${pathname}?${queryParams}`);
  };
  return (
    <div className="product-page-per-view">
      <Dropdown isOpen={dropdownOpen} toggle={toggle}>
        <DropdownToggle caret>{t(FilterSortData.find((elem) => elem.value == filter.sortBy)?.label || t("Sort"))}</DropdownToggle>
        <DropdownMenu>
          <div>
            {FilterSortData.map((elem, i) => (
              <DropdownItem key={i} onClick={() => handleSort(elem)}>
                {t(elem.label)}
              </DropdownItem>
            ))}
          </div>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default FilterSort;
