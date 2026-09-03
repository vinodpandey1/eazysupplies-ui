import ThemeOptionContext from "@/context/themeOptionsContext";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiArrowLeftSLine } from "react-icons/ri";
import { Accordion, AccordionHeader, AccordionItem } from "reactstrap";
import CollectionCategory from "./CollectionCategory";

const CollectionSidebar = ({ filter, setFilter, isOffcanvas, basicStoreCard, rightSideClass, sellerClass, isAttributes = true, hideCategory, categorySlug }) => {
  const { collectionMobile, setCollectionMobile, openOffCanvas, setOpenOffCanvas } = useContext(ThemeOptionContext);
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(["1"]);
  const toggle = (id) => {
    if (open.includes(id)) {
      setOpen(open.filter(item => item !== id)); // Close section
    } else {
      setOpen([...open, id]); // Open section
    }
  };

  useEffect(() => {
    if (!collectionMobile) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setCollectionMobile(false);
    };

    document.body.classList.add("collection-filter-open");
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.classList.remove("collection-filter-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [collectionMobile, setCollectionMobile]);
  return (
    <>
      {collectionMobile && <div className="bg-overlay collection-overlay show" onClick={() => setCollectionMobile(false)} />}
      <div className={`  ${openOffCanvas ? "d-block" : ""} ${sellerClass ? sellerClass : `col-xl-3 col-lg-4`} `}>
        <div className={`collection-filter sticky-top-section ${collectionMobile ? "open" : ""}`}>
          <div className="collection-filter-block accordion">
            {!isOffcanvas && (
              <div
                className="collection-mobile-back"
                onClick={() => {
                  setCollectionMobile((prev) => !prev);
                }}
              >
                <span className="filter-back">
                  <RiArrowLeftSLine />
                  {t("Back")}
                </span>
              </div>
            )}
            {isOffcanvas && (
              <div
                className="collection-mobile-back"
                onClick={() => {
                  setOpenOffCanvas((prev) => !prev);
                }}
              >
                <span className="filter-back">
                  <RiArrowLeftSLine />
                  <span>{t("Back")}</span>
                </span>
              </div>
            )}
            {basicStoreCard && basicStoreCard}
            <Accordion className={`collection-collapse-block open ${isOffcanvas ? "row" : ""}`} open={open} toggle={toggle}>
                  {!hideCategory && (
                    <AccordionItem className={`collection-collapse-block open ${isOffcanvas ? "col-lg-3" : ""}`}>
                      <AccordionHeader targetId="1" className="collapse-block-title">
                        <span>{t("Categories")}</span>
                      </AccordionHeader>
                      <CollectionCategory filter={filter} setFilter={setFilter} />
                    </AccordionItem>
                  )}
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
};

export default CollectionSidebar;
