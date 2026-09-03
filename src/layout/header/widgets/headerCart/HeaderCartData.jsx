import CartContext from "@/context/cartContext";
import SettingContext from "@/context/settingContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import { usePathname } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiCloseFill } from "react-icons/ri";
import HeaderCartBottom from "./HeaderCartBottom";

const HeaderCartData = () => {
  const { themeOption, setCartCanvas, cartCanvas } = useContext(ThemeOptionContext);
  const { settingData } = useContext(SettingContext);
  const { cartProducts, getTotal } = useContext(CartContext);
  const { t } = useTranslation("common");
  const [shippingCal, setShippingCal] = useState(0);
  const [shippingFreeAmt, setShippingFreeAmt] = useState(0);
  const [confetti, setConfetti] = useState(0);
  const confettiItems = Array.from({ length: 150 }, (_, index) => index);
  const [modal, setModal] = useState(false);
  const [cartStyle, setCartStyle] = useState("");
  const pathName = usePathname();

  useEffect(() => {
    const handleResize = () => {
      setCartStyle(window.innerWidth < 761 ? "cart_side" : themeOption?.general?.cart_style);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      setCartStyle(themeOption?.general?.cart_style);
    };
  }, [themeOption]);

  useEffect(() => {
    setCartCanvas(false);
  }, [pathName, setCartCanvas]);

  useEffect(() => {
    if (!cartCanvas) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setCartCanvas(false);
    };

    document.body.classList.add("cart-canvas-open");
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.classList.remove("cart-canvas-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [cartCanvas, setCartCanvas]);

  useEffect(() => {
    setShippingFreeAmt(settingData?.general?.min_order_free_shipping);
    cartProducts?.forEach((elem) => {
      if (elem?.variation) {
        elem.variation.selected_variation = elem?.variation?.attribute_values?.map((values) => values.value).join("/");
      }
    });
  }, [cartProducts, settingData]);

  useEffect(() => {
    const total = getTotal(cartProducts);
    
    const shippingFreeAmount = settingData?.general?.min_order_free_shipping || shippingFreeAmt;
    const tempCal = (total * 100) / shippingFreeAmount;

    if (tempCal > 100) {
      setShippingCal(100);
      if (confetti === 0) {
        setConfetti(1);
        const timer = setTimeout(() => {
          setConfetti(2);
        }, 3000);
        return () => clearTimeout(timer);
      }
    } else {
      setShippingCal(tempCal);
      setConfetti(0);
    }
  }, [ settingData, shippingFreeAmt, getTotal(cartProducts )]);

  return (
    <>
      <div id="cart_side" className={`${cartCanvas ? "open-side" : ""} ${cartStyle === "cart_mini" ? "show-div shopping-cart" : "add_to_cart right right-cart-box"}`}>
        <button type="button" className="overlay" aria-label={t("CloseCart")} onClick={() => setCartCanvas(false)} />
        <div className="cart-inner" role="dialog" aria-modal="true" aria-label={t("MyCart")}>
          <div className="cart_top">
            <h3>
              {t("MyCart")} <span>{`(${cartProducts?.length})`}</span>
            </h3>
            <button type="button" className="close-cart" aria-label={t("CloseCart")} onClick={() => setCartCanvas(false)}>
              <RiCloseFill />
            </button>
          </div>
          <HeaderCartBottom modal={modal} setModal={setModal} shippingCal={shippingCal} shippingFreeAmt={shippingFreeAmt} />
        </div>
        {themeOption?.general?.celebration_effect && confetti === 1 && cartCanvas && (
          <div className="confetti-wrapper show">
            {confettiItems.map((elem, i) => (
              <div className={`confetti-${elem}`} key={i}></div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default HeaderCartData;
