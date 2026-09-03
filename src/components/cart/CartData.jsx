import CartContext from "@/context/cartContext";
import SettingContext from "@/context/settingContext";
import { WishlistAPI } from "@/utils/axiosUtils/API";
import { Href } from "@/utils/constants";
import useCreate from "@/utils/hooks/useCreate";
import Link from "next/link";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { RiCloseLine } from "react-icons/ri";
import { Col, Row } from "reactstrap";
import CartProductDetail from "./CartProductDetail";
import HandleQuantity from "./HandleQuantity";
import { calculateCartLine } from "@/utils/pricing/orderTotals";

const CartData = ({ elem }) => {
  const { t } = useTranslation("common");
  const { removeCart } = useContext(CartContext);
  const { convertCurrency } = useContext(SettingContext);
  const { mutate } = useCreate(WishlistAPI, false);
  const line = calculateCartLine(elem);

  const removeItem = () => {
    removeCart(elem?.variation_id ? elem?.variation_id : elem.product_id, elem?.id);
  };

  return (
    <tr>
      <CartProductDetail elem={elem} />
      <td>
        <Link href={`/product/${elem?.product?.id}`} className="text-wrap text-break">{ elem?.product?.name}</Link>
        <Row className="mobile-cart-content">
          <Col>
            <div className="qty-box">
              <HandleQuantity productObj={elem?.product} classes={{ customClass: "quantity-price" }} elem={elem} />
            </div>
          </Col>
          <Col className="table-price">
            <h2 className="td-color">
              {convertCurrency(line.unitPrice)}
              {line.hasOffer ? <del className="text-content">{convertCurrency(line.regularUnitPrice)}</del> : null}
            </h2>
          </Col>
          <Col>
            <a href={Href} className="icon remove-btn" onClick={removeItem}>
              <RiCloseLine />
            </a>
          </Col>
        </Row>
      </td>
      <td className="table-price">
        <h2>
          {convertCurrency(line.unitPrice)}
          {line.hasOffer ? <del className="text-content">{convertCurrency(line.regularUnitPrice)}</del> : null}
        </h2>
        {line.savings > 0 ? (
          <h6 className="theme-color">
            {t("YouSave")}: {convertCurrency(line.savings)}
          </h6>
        ) : null}
      </td>

      <td>
        <div className="qty-box">
          <HandleQuantity productObj={elem?.product} classes={{ customClass: "quantity-price" }} elem={elem} />
        </div>
      </td>

      <td className="subtotal">
        <h2 className="td-color">{convertCurrency(line.total)}</h2>
      </td>

      <td>
        <a href={Href} className="icon remove-btn" onClick={removeItem}>
          <RiCloseLine />
        </a>
      </td>
    </tr>
  );
};

export default CartData;
