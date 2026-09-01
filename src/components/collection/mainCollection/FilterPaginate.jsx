import { FilterPaginateData } from "@/data/CustomData";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";

const FilterPaginate = ({ filter, setFilter }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const { t } = useTranslation("common");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState(filter?.paginate);

  useEffect(() => {
    setState(filter?.paginate);
  }, [filter?.paginate]);

  const handleSort = (data) => {
    setState(data?.value);
    const queryParams = new URLSearchParams(searchParams.toString());
    queryParams.set("paginate", data.value);
    queryParams.delete("page");
    setFilter((prev) => {
      return {
        ...prev,
        paginate: data.value,
      };
    });
    router.replace(`${pathname}?${queryParams.toString()}`, { scroll: false });
  };
  return (
    <div className="product-page-filter">
      <Dropdown isOpen={dropdownOpen} toggle={toggle}>
        <DropdownToggle caret>
          <span>{FilterPaginateData.find((elem) => elem.value == state)?.label || t("SortItem")}</span>
        </DropdownToggle>
        <DropdownMenu>
          <div>
            {FilterPaginateData.map((elem, i) => (
              <DropdownItem key={i} onClick={() => handleSort(elem)}>
                {elem.value} {t(elem.label.split(" ")[1])}
              </DropdownItem>
            ))}
          </div>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default FilterPaginate;
