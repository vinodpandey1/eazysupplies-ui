import CartContext from "@/context/cartContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import React, { useContext, useMemo } from "react";
import { RiShoppingCartLine } from "react-icons/ri";

const HeaderCart = () => {
  const { cartProducts } = useContext(CartContext);
  const { cartCanvas, setCartCanvas } = useContext(ThemeOptionContext);
  const cartQuantity = useMemo(
    () => cartProducts?.reduce((total, item) => total + Math.max(0, Number(item?.quantity) || 0), 0) || 0,
    [cartProducts],
  );

  return (
    <>
      <button
        type="button"
        className="header-cart-trigger"
        aria-label="Open shopping cart"
        aria-controls="cart_side"
        aria-expanded={cartCanvas}
        aria-haspopup="dialog"
        onClick={() => setCartCanvas(true)}
      >
        <RiShoppingCartLine />
      </button>
      {cartQuantity > 0 && <span className="cart_qty_cls ">{cartQuantity}</span>}
    </>
  );
};

export default HeaderCart;
