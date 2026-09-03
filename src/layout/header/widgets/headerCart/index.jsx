import CartContext from "@/context/cartContext";
import React, { useContext } from "react";
import { RiShoppingCartLine } from "react-icons/ri";
import Link from "next/link";

const HeaderCart = () => {
  const { cartProducts } = useContext(CartContext);
  return (
    <>
      <Link  href={`/cart`}>
        <RiShoppingCartLine onClick={() => {}} />
      </Link>
      {cartProducts?.length > 0 && <span className="cart_qty_cls ">{cartProducts?.length}</span>}
    </>
  );
};

export default HeaderCart;
