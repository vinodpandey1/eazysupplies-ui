import AccountContext from "@/context/accountContext";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { Nav, NavItem, NavLink } from "reactstrap";
import ConfirmationModal from "./ConfirmationModal";
import { useQueryClient } from "@tanstack/react-query";
import CartContext from "@/context/cartContext";
import ThemeOptionContext from "@/context/themeOptionsContext";

const NavTabTitles = ({ classes = {}, activeTab, setActiveTab, titleList, isLogout, callBackFun }) => {
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const { setAccountData } = useContext(AccountContext);
  const { clearCart } = useContext(CartContext);
  const { setCartCanvas } = useContext(ThemeOptionContext);
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();
  const checkType = (value, index) => {
    if (typeof activeTab == "object") {
      return activeTab.id == value.id;
    } else {
      return activeTab == String(index + 1);
    }
  };

  const clearAllCookies = () => {
  const allCookies = Cookies.get() // Gets an object of all cookies
  Object.keys(allCookies).forEach(cookieName => {
    Cookies.remove(cookieName, { path: '/' }) // Ensure path matches where it was set
  })
}

  const handleLogout = () => {
    // Clear visible and persisted cart state before the account view unmounts.
    // CartProvider also invalidates any in-flight pricing refresh here.
    clearCart(true);
    setCartCanvas(false);
    clearAllCookies();
    setAccountData();
    Cookies.remove("authToken");
    Cookies.remove("ue");
    Cookies.remove("account");
    Cookies.remove("CookieAccept");
    localStorage.clear();
    Cookies.remove("uat", { path: "/" });
    queryClient.clear();
    router.push(`/`);
    router.refresh();
    setModal(false);
  };

  const onNavClick = (elem, i) => {
    setActiveTab((prev) => (typeof prev == "object" ? elem : String(i + 1)));
    elem.path && router.push(`${elem.path}`);
    callBackFun && callBackFun();
  };
  return (
    <>
      <Nav className={classes?.navClass}>
        {titleList.map((elem, i) => (
          <NavItem key={i}>
            <NavLink className={checkType(elem, i) ? "active" : ""} onClick={() => onNavClick(elem, i)}>
              {elem.icon && elem.icon}
              {t(elem?.title) || t(elem?.name)}
            </NavLink>
          </NavItem>
        ))}
        {isLogout && (
          <NavItem className="logout-cls">
            <a className="btn loagout-btn" onClick={() => setModal(true)}>
              <RiLogoutBoxRLine className="me-2" />
              {t("LogOut")}
            </a>
          </NavItem>
        )}
      </Nav>
      <ConfirmationModal modal={modal} setModal={setModal} confirmFunction={handleLogout} />
    </>
  );
};

export default NavTabTitles;
