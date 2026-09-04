import WrapperComponent from "@/components/widgets/WrapperComponent";
import React from "react";
import { Col, Container, Row } from "reactstrap";
import CustomerOrderCount from "../common/CustomerOrderCount";
import OfferTimer from "../common/OfferTimer";
import PaymentOptions from "../common/PaymentOptions";
import ProductBundle from "../common/ProductBundle";
import ProductContent from "../common/ProductContent";
import ProductDeliveryInformation from "../common/ProductDeliveryInformation";
import ProductDetailsTab from "../common/ProductDetailsTab";
import ProductInformation from "../common/ProductInformation";
import ProductStatus from "../common/ProductStatus";
import RelatedProduct from "../common/RelatedProduct";
import WishlistCompareShare from "../common/WishlistCompareShare";
import ThumbnailProductImage from "../productThumbnail/ThumbnailImage";

const ProductColumn = ({ productState, setProductState, direction }) => {
  return (
    <section className="collection-wrapper section-t-space product-experience pdp-v2">
      <Container>
        <Row className="g-4 align-items-start">
          <Col xl="5" lg="6">
            <ThumbnailProductImage productState={productState} slideToShow={3} />
          </Col>
          <Col xl="7" lg="6">
            <div className="product-right product-description-box product-page-details pdp-purchase-panel">
              <CustomerOrderCount productState={productState} />
              <ProductContent productState={productState} setProductState={setProductState} />
              <ProductStatus productState={productState} />
              <WishlistCompareShare productState={productState} />
              {productState?.product.status && productState?.product?.sale_starts_at && productState?.product?.sale_expired_at && <OfferTimer productState={productState} />}
              <ProductInformation productState={productState} />
              <ProductDeliveryInformation productState={productState} />
              <PaymentOptions productState={productState} />
              {productState?.product?.cross_sell_products?.length > 0 && <ProductBundle productState={productState} setProductState={setProductState} />}
            </div>
          </Col>
        </Row>
        <WrapperComponent classes={{ sectionClass: "tab-product product-details-contain section-b-space m-0", fluidClass: "container" }} customCol={true}>
          <ProductDetailsTab productState={productState} setProductState={setProductState} />
        </WrapperComponent>
        <RelatedProduct productState={productState} />
      </Container>
    </section>
  );
};

export default ProductColumn;
