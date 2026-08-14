import ThemeOptionContext from "@/context/themeOptionsContext";
import { Href } from "@/utils/constants";
import { t } from "i18next";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import { RiHeartLine, RiHome2Line, RiSearch2Line, RiShoppingBagLine, RiUserLine } from "react-icons/ri";
import AccountContext from "@/context/accountContext";

const MobileMenu = () => {
  const { setOpenAuthModal, setCartCanvas } = useContext(ThemeOptionContext);

  const { accountData } = useContext(AccountContext);
  const isAuthenticated = Boolean(accountData?.data?.id || Cookies.get("uat"));
  const router = useRouter();
  const handleProfileClick = (event) => {
    event.preventDefault();
    accountData?.data?.id || Cookies.get("uat") ? router.push("/account/dashboard") : setOpenAuthModal(true);
    handleActive(5);
  };
  const handleWishlist = () => {
    isAuthenticated ? router.push("/wishlist") : setOpenAuthModal(true);
    handleActive(4);
  };
  const [active, setActive] = useState(1);
  const handleActive = (num) => {
    setActive(num);
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
          <a href={"/cart"} onClick={() => setCartCanvas(true)}>
            <RiShoppingBagLine />
            <span>{t("Cart")}</span>
          </a>
        </li>
        <li className={active == "4" ? "active" : ""}>
          <a href={"/account/order"} onClick={() => handleWishlist()}>
            <RiHeartLine />
            <span>{t("Order") ? t("Order") : "Order"}</span>
          </a>
        </li>
        <li className={active == "5" ? "active" : ""}>
          <a href={"/account/dashboard"} onClick={handleProfileClick}>
            <RiUserLine />
            <span>{t("User")}</span>
          </a>
        </li>
      </ul>
    </div>
  );
};

export default MobileMenu;
