import { FilterSortData } from "@/data/CustomData";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";

const FilterSort = ({ filter, setFilter }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const { t } = useTranslation("common");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const handleSort = (data) => {
    const isNameSort = data?.value === "a-z" || data?.value === "z-a";
    const field = isNameSort ? "name" : "price";

    setFilter((prev) => {
      return {
        ...prev,
        sortBy: data.value,
        field,
      };
    });

    const queryParams = new URLSearchParams(searchParams.toString());
    queryParams.set("sortBy", data.value);
    queryParams.set("field", field);
    queryParams.delete("page");
    router.replace(`${pathname}?${queryParams.toString()}`);
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
