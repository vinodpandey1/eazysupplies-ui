import NoDataFound from "@/components/widgets/NoDataFound";
import CategoryContext from "@/context/categoryContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AccordionBody, Input, Label } from "reactstrap";

const CollectionCategory = ({ filter, setFilter }) => {
  const { categoryData = [] } = useContext(CategoryContext);
  const { setCollectionMobile } = useContext(ThemeOptionContext);
  const [showList, setShowList] = useState([]);
  const { t } = useTranslation("common");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasValue = (item, term) => {
    let valueToReturn = false;
    if (item && item["name"] && item["name"].toLowerCase().includes(term?.toLowerCase())) {
      valueToReturn = true;
    }
    item["subcategories"]?.length &&
      item["subcategories"].forEach((child) => {
        if (hasValue(child, term)) {
          valueToReturn = true;
        }
      });
    return valueToReturn;
  };

  const filterCategories = (item, term) => {
    const matchingSubcategories = item.subcategories?.map((subcat) => filterCategories(subcat, term)).filter((subcat) => subcat);

    if (item.name.toLowerCase().includes(term.toLowerCase()) || matchingSubcategories?.length) {
      return {
        ...item,
        subcategories: matchingSubcategories,
      };
    }
    return null;
  };

  const handleChange = (event) => {
    const keyword = event.target.value.toLowerCase();
    if (keyword !== "") {
      const updatedData = categoryData
        ?.map((item) => filterCategories(item, keyword))
        .filter((item) => item);
      setShowList(updatedData);
    } else {
      setShowList(visibleCategories(categoryData));
    }
  };
  const redirectToCollection = (event, slug, name) => {
    let temp = [...filter?.category];

    if (!temp.includes(slug)) {
      temp.push(slug);
    } else {
      temp = temp.filter((elem) => elem !== slug);
    }
    setFilter((prev) => {
      return {
        ...prev,
        category: temp,
        brand: [],
      };
    });
    const queryParams = new URLSearchParams(searchParams.toString());
    queryParams.delete("brand");
    if (temp.length > 0) queryParams.set("category", temp.join(","));
    else queryParams.delete("category");
    queryParams.delete("page");
    if (temp.length === 1) queryParams.set("title", temp[0] === slug ? name : findCategoryName(categoryData, temp[0]) || name);
    else if (temp.length > 1) queryParams.set("title", "Selected Categories");
    else queryParams.delete("title");
    setCollectionMobile(false);
    router.push(`${pathname}?${queryParams.toString()}`, { scroll: false });
  };

  useEffect(() => {
    setShowList(visibleCategories(categoryData));
  }, [categoryData]);

  return (
    <div className="accordion-collapse collapse show">
      <AccordionBody accordionId="1">
        {visibleCategories(categoryData).length > 5 && (
          <div className="theme-form search-box">
            <Input placeholder={t("Search")} onChange={handleChange} />
          </div>
        )}

        {showList?.length > 0 ? <RecursiveCategory redirectToCollection={redirectToCollection} categories={showList} filter={filter} /> : <NoDataFound customClass="search-not-found-box" title="NoCategoryFound" />}
      </AccordionBody>
    </div>
  );
};

export default CollectionCategory;

const findCategoryName = (categories = [], id) => {
  for (const category of categories) {
    if (String(category?.id) === String(id)) return category?.name;
    const nestedName = findCategoryName(category?.subcategories || [], id);
    if (nestedName) return nestedName;
  }
  return "";
};

const visibleCategories = (categories = []) =>
  categories.filter((category) => category?.name?.trim()?.toUpperCase() !== "DEFAULT");

const RecursiveCategory = ({ redirectToCollection, categories, filter }) => (
  <ul className="shop-category-list custom-sidebar-height">
    {categories.map((elem, i) => (
      <li key={i}>
        <div className="form-check collection-filter-checkbox">
          <Input className="form-check-input" type="checkbox" id={`category-${elem?.id}`} checked={filter?.category?.includes(String(elem?.id))} onChange={(e) => redirectToCollection(e, String(elem?.id), elem?.name)} />
          <Label className="form-check-label" htmlFor={`category-${elem?.id}`}>
            <span className="name">{elem?.name}</span>
          </Label>
        </div>
        {elem?.subcategories?.length > 0 ? (
          <ul className="sub-category-list">
            <RecursiveCategory redirectToCollection={redirectToCollection} categories={elem?.subcategories} filter={filter} />
          </ul>
        ) : null}
      </li>
    ))}
  </ul>
);
