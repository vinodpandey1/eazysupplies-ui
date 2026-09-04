import ThemeOptionContext from "@/context/themeOptionsContext";
import { t } from "i18next";
import Cookies from "js-cookie";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import { RiHeartLine, RiHome2Line, RiSearch2Line, RiShoppingBagLine, RiUserLine } from "react-icons/ri";

const MobileMenu = () => {
  const { setOpenAuthModal, setCartCanvas } = useContext(ThemeOptionContext);

  const isAuthenticated = Cookies.get("uat");
  const [active, setActive] = useState(1);

  useEffect(() => {
    document.body.classList.add("has-mobile-menu");
    return () => document.body.classList.remove("has-mobile-menu");
  }, []);
  const handleActive = (num) => {
    setActive(num);
  };
  const handleProtectedNavigation = (event, num) => {
    handleActive(num);
    setCartCanvas(false);
    if (!isAuthenticated) {
      event.preventDefault();
      setOpenAuthModal(true);
    }
  };
  return (
    <div className="mobile-menu d-md-none d-block mobile-cart">
      <ul>
        <li className={active == "1" ? "active" : ""} onClick={() => handleActive(1)}>
          <Link href={"/"}>
            <RiHome2Line />
            <span>{t("Home")}</span>
          </Link>
        </li>
        <li className={active == "2" ? "active" : ""}>
          <Link href={"/search"} onClick={() => handleActive(2)}>
            <RiSearch2Line />
            <span>{t("Search")}</span>
          </Link>
        </li>
        <li className={active == "3" ? "active" : ""}>
          <button type="button" aria-label={t("Cart")} aria-controls="cart_side" aria-haspopup="dialog" onClick={() => { handleActive(3); setCartCanvas(true); }}>
            <RiShoppingBagLine />
            <span>{t("Cart")}</span>
          </button>
        </li>
        <li className={active == "4" ? "active" : ""}>
          <Link href="/account/order" onClick={(event) => handleProtectedNavigation(event, 4)}>
            <RiHeartLine />
            <span>{t("Order") ? t("Order") : "Order"}</span>
          </Link>
        </li>
        <li className={active == "5" ? "active" : ""}>
          <Link href="/account/dashboard" onClick={(event) => handleProtectedNavigation(event, 5)}>
            <RiUserLine />
            <span>{t("User")}</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default MobileMenu;
