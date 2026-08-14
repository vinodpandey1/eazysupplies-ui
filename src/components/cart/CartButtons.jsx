import ThemeOptionContext from "@/context/themeOptionsContext";
import Cookies from "js-cookie";
import Link from "next/link";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Col, Row } from "reactstrap";

const CartButtons = () => {
  const { t } = useTranslation("common");
  const { setOpenAuthModal } = useContext(ThemeOptionContext);

  const handleCheckout = (event) => {
    if (!Cookies.get("uat")) {
      event.preventDefault();
      Cookies.set("CallBackUrl", "/checkout");
      setOpenAuthModal(true);
    }
  };
  return (
    <Row className=" cart-buttons">
      <Col xs="6">
        <Link href="/collections" className="btn">
          {t("ContinueShopping")}
        </Link>
      </Col>
      <Col xs="6">
        <Link href="/checkout" className="btn" onClick={handleCheckout}>
          {t("Checkout")}
        </Link>
      </Col>
    </Row>
  );
};

export default CartButtons;
