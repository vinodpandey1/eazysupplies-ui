import CartContext from "@/context/cartContext";
import SettingContext from "@/context/settingContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import Btn from "@/elements/buttons/Btn";
import Cookies from "js-cookie";
import Link from "next/link";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { RiArrowLeftLine } from "react-icons/ri";
import { Col } from "reactstrap";
import { calculateCartTotals } from "@/utils/pricing/orderTotals";

const CartSidebar = () => {
  const { cartProducts } = useContext(CartContext);
  const { convertCurrency } = useContext(SettingContext);
  const { setOpenAuthModal } = useContext(ThemeOptionContext);
  const { t } = useTranslation("common");
  const isAuth = Cookies.get("uat");
  const { subtotal, regularSubtotal, totalSavings } = calculateCartTotals(cartProducts);
  return (
    <Col xxl={3} xl={4}>
      <div className="summery-box p-sticky">
        <div className="summery-header">
          <h3>{t("CartTotal")}</h3>
        </div>

        <div className="summery-contain">
          <ul>
            {totalSavings > 0 && (
              <li>
                <h4>Regular subtotal</h4>
                <h4 className="price cart-regular-total">{convertCurrency(regularSubtotal)}</h4>
              </li>
            )}
            {totalSavings > 0 && (
              <li className="cart-offer-savings">
                <h4>{t("YouSave")}</h4>
                <h4 className="price">-{convertCurrency(totalSavings)}</h4>
              </li>
            )}
            <li>
              <h4>{t("Subtotal")}</h4>
              <h4 className="price">{convertCurrency(subtotal)}</h4>
            </li>

            <li className="align-items-start">
              <h4>{t("Shipping")}</h4>
              <h4 className="price text-end">{t("CostatCheckout")}</h4>
            </li>

            <li className="align-items-start">
              <h4>{t("Tax")}</h4>
              <h4 className="price text-end">{t("CostatCheckout")}</h4>
            </li>
          </ul>
        </div>

        <ul className="summery-total">
          <li className="list-total border-top-0">
            <h4>{t("Total")}</h4>
            <h4 className="price theme-color">{convertCurrency(subtotal)}</h4>
          </li>
        </ul>

        <div className="button-group cart-button">
          <ul>
            <li>
              <Link href={isAuth ? `/checkout` : `${setOpenAuthModal(true)}`} className="btn btn-animation proceed-btn fw-bold">
                {t("ProcessToCheckout")}
              </Link>
            </li>

            <li>
              <Btn className="btn-light shopping-button text-dark">
                <RiArrowLeftLine /> {t("ReturnToShopping")}
              </Btn>
            </li>
          </ul>
        </div>
      </div>
    </Col>
  );
};

export default CartSidebar;
