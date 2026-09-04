import RatingBox from "@/components/collection/collectionSidebar/RatingBox";
import CartContext from "@/context/cartContext";
import SettingContext from "@/context/settingContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import { Href } from "@/utils/constants";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiQuestionnaireLine, RiRulerLine, RiShoppingCartLine, RiTruckLine } from "react-icons/ri";
import AddToCartButton from "./AddToCartButton";
import DeliveryReturnModal from "./allModal/DeliveryReturnModal";
import QuestionAnswerModal from "./allModal/QuestionAnswerModal";
import SizeModal from "./allModal/SizeModal";
import ProductAttribute from "./productAttribute/ProductAttribute";
import ProductDetailAction from "./ProductDetailAction";
import Btn from "@/elements/buttons/Btn";
import { getProductPricing, getUnitLabel } from "@/utils/pricing/productPricing";

const cleanDescriptionText = (html = "") =>
  String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

const truncateAtWord = (value, maxLength = 280) => {
  if (value.length <= maxLength) return value;
  const shortened = value.slice(0, maxLength + 1);
  return `${shortened.slice(0, shortened.lastIndexOf(" ") || maxLength).trim()}…`;
};

const ProductContent = ({ productState, setProductState, productAccordion, noDetails, noQuantityButtons, noModals }) => {
  const { t } = useTranslation("common");
  const { setProductQuantity, isLoading } = useContext(CartContext);
  const { convertCurrency } = useContext(SettingContext);
  const { setCartCanvas, themeOption } = useContext(ThemeOptionContext);
  const router = useRouter();
  const product = productState?.product || {};
  const pricing = getProductPricing(product, productState?.selectedVariation);
  const unitLabel = getUnitLabel(product);
  const productSummary = truncateAtWord(
    cleanDescriptionText(
      productState?.selectedVariation?.short_description ||
        product?.short_description ||
        product?.description ||
        "",
    ),
  );

  const openCartWithoutScrolling = () => {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const restoreScroll = () => window.scrollTo({ left: scrollX, top: scrollY, behavior: "auto" });

    setCartCanvas(true);
    window.requestAnimationFrame(() => {
      restoreScroll();
      window.requestAnimationFrame(restoreScroll);
    });
  };

  const addToCart = () => {
    const updated = setProductQuantity(productState?.productQty, productState?.product, productState);
    if (updated !== false) openCartWithoutScrolling();
  };

  const buyNow = () => {
    const updated = setProductQuantity(productState?.productQty, productState?.product, productState);
    if (updated !== false) router.push(`/checkout`);
  };
  const [modal, setModal] = useState("");
  const activeModal = {
    size: <SizeModal modal={modal} setModal={setModal} productState={productState} />,
    delivery: <DeliveryReturnModal modal={modal} setModal={setModal} productState={productState} />,
    qna: <QuestionAnswerModal modal={modal} setModal={setModal} productState={productState} />,
  };

  return (
    <>
      {!noDetails && (
        <>
          <h2 className="main-title">{productState?.selectedVariation?.name ?? productState?.product?.name}</h2>
          {!productState?.product?.is_external && (
            <div className="product-rating">
              {/*Commented By Simran*/}
              {/*<RatingBox totalRating={productState?.selectedVariation?.rating_count ?? productState?.product?.rating_count} />
              <span className="divider">|</span>
              <a href={Href} className="mb-0">
                {productState?.selectedVariation?.reviews_count || productState?.product?.reviews_count || 0} {t("Review")}
              </a>*/}
            </div>
          )}
          <div className="price-text">
            <h3
              className="product-price-display"
              data-offer-type={pricing.offerType || "standard"}
              aria-label={`Price ${convertCurrency(pricing.sellingPrice)}${pricing.hasOffer ? `, was ${convertCurrency(pricing.regularPrice)}, ${pricing.discountPercentage}% off` : ""}`}
            >
              <span className="price-label">{t("Price")}:</span>
              <span className="selling-price">{convertCurrency(pricing.sellingPrice)}</span>
              {unitLabel && <span className="unit-label"> {unitLabel}</span>}
              {pricing.hasOffer && (
                <del className="regular-price" aria-label={`Regular price ${convertCurrency(pricing.regularPrice)}`}>
                  {convertCurrency(pricing.regularPrice)}
                </del>
              )}
              {pricing.hasOffer && <span className="discounted-price">{pricing.discountPercentage}% {t("Off")}</span>}
              {pricing.hasOffer && pricing.discountAmount > 0 && (
                <span className="discount-amount">{t("Save")} {convertCurrency(pricing.discountAmount)}</span>
              )}
            </h3>
            {pricing.hasOffer && pricing.offerName && (
              <span className="customer-offer-name">{pricing.offerName}</span>
            )}
            <span className="tax-caption">{t("InclusiveAllTheTax")}</span>
          </div>
          {productSummary && <p className="description-text product-summary">{productSummary}</p>}
        </>
      )}
      {!noModals ? (
        productState?.product?.size_chart_image || productState?.product?.is_return ? (
          <>
            <div className="size-delivery-info">
              {productState?.product?.size_chart_image && productState?.product?.size_chart_image.original_url && (
                <a href={Href} onClick={() => setModal("size")}>
                  <RiRulerLine /> {t("SizeChart")}
                </a>
              )}
              {themeOption?.product?.shipping_and_return && productState?.product?.is_return ? (
                <a href={Href} onClick={() => setModal("delivery")}>
                  <RiTruckLine /> {t("DeliveryReturn")}
                </a>
              ) : null}
              <a href={Href} onClick={() => setModal("qna")}>
                <RiQuestionnaireLine /> {t("Askaquestion")}
              </a>
            </div>
            {modal && activeModal[modal]}
          </>
        ) : null
      ) : null}

      {!noQuantityButtons && (
        <>
          {productState?.product.status && !productAccordion && <>{productState?.product?.type == "classified" && <ProductAttribute productState={productState} setProductState={setProductState} />}</>}
        </>
      )}

      {!productAccordion && (
        <div className="product-buttons">
          <>
            <ProductDetailAction productState={productState} setProductState={setProductState} />
            <AddToCartButton productState={productState} isLoading={isLoading} addToCart={addToCart} buyNow={buyNow} />
          </>
        </div>
      )
      }
    </>
  );
};

export default ProductContent;
