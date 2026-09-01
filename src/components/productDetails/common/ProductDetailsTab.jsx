"use client";

import NavTabTitles from "@/components/widgets/NavTabs";
import NoDataFound from "@/components/widgets/NoDataFound";
import { useEffect, useState } from "react";
import { Col, Row, TabContent, TabPane } from "reactstrap";
import CustomerReview from "./CustomerReview";
import QnATab from "./QnATab";
import { RiArrowDownSLine } from "react-icons/ri";
import Btn from "@/elements/buttons/Btn";

const ALLOWED_DESCRIPTION_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "li",
  "ol",
  "p",
  "pre",
  "span",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
]);

const ALLOWED_DESCRIPTION_ATTRIBUTES = {
  a: new Set(["href", "target", "title"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan", "scope"]),
};

const isSafeLink = (value) => {
  const normalizedValue = value.trim().toLowerCase();
  return normalizedValue.startsWith("http://") || normalizedValue.startsWith("https://") || normalizedValue.startsWith("mailto:") || normalizedValue.startsWith("tel:") || normalizedValue.startsWith("/") || normalizedValue.startsWith("#");
};

const sanitizeDescription = (html) => {
  if (!html || typeof window === "undefined") return "";

  const documentFragment = document.implementation.createHTMLDocument("");
  documentFragment.body.innerHTML = html;
  documentFragment.querySelectorAll("script, style, iframe, object, embed, form, input, button, meta, link").forEach((element) => element.remove());

  documentFragment.body.querySelectorAll("*").forEach((element) => {
    const tagName = element.tagName.toLowerCase();

    if (!ALLOWED_DESCRIPTION_TAGS.has(tagName)) {
      element.replaceWith(...element.childNodes);
      return;
    }

    const allowedAttributes = ALLOWED_DESCRIPTION_ATTRIBUTES[tagName] || new Set();
    Array.from(element.attributes).forEach((attribute) => {
      if (!allowedAttributes.has(attribute.name.toLowerCase())) {
        element.removeAttribute(attribute.name);
      }
    });

    if (tagName === "a") {
      const href = element.getAttribute("href");
      if (href && !isSafeLink(href)) element.removeAttribute("href");
      if (element.getAttribute("target") === "_blank") element.setAttribute("rel", "noopener noreferrer");
    }
  });

  return documentFragment.body.innerHTML;
};

const ProductDetailsTab = ({ productState }) => {
  const [showMore, setShowMore] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [safeDescription, setSafeDescription] = useState("");
  const description = productState?.product?.description || "";
  const ProductDetailsTabTitle = [
    { id: 1, name: "Description" },
    //{ id: 2, name: "Review" },
    //{ id: 3, name: "QA" },
  ];

  const seeMore = () => {
    setShowMore((currentValue) => !currentValue);
  };

  useEffect(() => {
    setSafeDescription(sanitizeDescription(description));
    setShowMore(false);
  }, [description]);

  return (
    <Col sm={12} lg={12} className="pdp-description-panel">
      <NavTabTitles classes={{ navClass: "nav nav-tabs nav-material" }} titleList={ProductDetailsTabTitle} activeTab={activeTab} setActiveTab={setActiveTab} />
      <TabContent className="nav-material" activeTab={activeTab}>
        <TabPane className={activeTab == 1 ? "show active" : ""}>
          <div className={`product-description more-less-box ${showMore ? "more" : ""}`}>
            <div className={`product-description-content text-content ${showMore ? "is-expanded" : ""}`} dangerouslySetInnerHTML={{ __html: safeDescription }} />
            {description.length > 1500 && (
              <Btn className="btn-solid hover-solid bg-theme btn-md scroll-button btn-sm mt-3 more-lest-btn" onClick={seeMore}>
                {showMore ? "Show Less" : "Show more"}
                <RiArrowDownSLine />
              </Btn>
            )}
          </div>
        </TabPane>

        <TabPane className={activeTab == 2 ? "show active" : ""}>
          <div className="single-product-tables ">
            <Row>
              {productState?.product?.can_review || productState?.product?.reviews_count ? (
                <CustomerReview productState={productState} />
              ) : (
                <Col xl={12}>
                  <NoDataFound customClass="no-data-added" title="NoReviewYet" description="NoReviewYetDescription" />
                </Col>
              )}
            </Row>
          </div>
        </TabPane>
        <TabPane className={activeTab == 3 ? "show active" : ""}>
          <QnATab productState={productState} activeTab={activeTab} />
        </TabPane>
      </TabContent>
    </Col>
  );
};

export default ProductDetailsTab;
