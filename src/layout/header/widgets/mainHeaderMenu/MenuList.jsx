import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import LinkBox from "./LinkBox";
import MenuMedia from "./MenuMedia";
import Link from "next/link";
import Cookies from "js-cookie";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";
import { useContext } from "react";
import ThemeOptionContext from "@/context/themeOptionsContext";

const MenuList = ({ menu, isOpen, setIsOpen, closeMenus, level }) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const redirect = (path) => {
    router.push(`/${path}`);
  };
  const isAuthenticated = Cookies.get("uat");
  const { setOpenAuthModal } = useContext(ThemeOptionContext);
  const isBrandMenu = menu?.child?.some((item) => item?.title?.toLowerCase() === "brand list");

  const protectedRoutes = [`/account/dashboard`, `/account/notification`, `/account/wallet`, `/account/bank-details`, `/account/bank-details`, `/account/point`, `/account/refund`, `/account/order`, `/account/addresses`, `/wishlist`, `/compare`];

  const protectedRoute = (route) => {
    if (!isAuthenticated && protectedRoutes.includes(route)) {
      ToastNotification("error", "Unauthenticated");
      setOpenAuthModal(true);
    }
  };

  return (
    <>
      <li suppressHydrationWarning className={`${menu.link_type == "sub" && menu.child ? "nav-item dropdown" : "nav-item"} ${menu?.badge_text ? "new-nav-item" : ""} ${menu.mega_menu && !isBrandMenu ? "dropdown-mega" : ""}`}>
        {menu.link_type === "sub" && (
          <a
            onClick={() => {
              const temp = isOpen.slice();
              temp[level] = menu.title !== temp[level] && menu.title;
              setIsOpen(temp);
            }}
            className="nav-link dropdown-toggle"
          >
            <span>{t(menu.title)}</span>
            {menu.badge_text && <label className="new-dropdown">{menu.badge_text}</label>}
          </a>
        )}

        {menu.link_type === "link" && menu.is_target_blank === 0 && (
          <Link onClick={() => { protectedRoute(menu.path); closeMenus(); }} className={`dropdown-item ${isOpen[level] === menu.title ? "show" : ""}`} href={`${menu.path.charAt(0) == "/" ? menu.path : `/${menu.path}`}`}>
            {t(menu.title)}
            {menu.badge_text && <label className={`menu-label ${menu?.badge_color ? menu?.badge_color : ""}`}>{menu?.badge_text}</label>}
          </Link>
        )}

        {menu?.is_target_blank === 1 && (
          <a onClick={closeMenus} className={`dropdown-item ${isOpen[level] === menu?.title ? "show" : ""}`} href={menu?.path}>
            {t(menu?.title)}
            {menu?.badge_text && <label className={`menu-label ${menu?.badge_color ? menu?.badge_color : ""}`}>{menu?.badge_text}</label>}
          </a>
        )}
        {menu?.mega_menu === 1 && isBrandMenu ? (
          <div
            className={`dropdown-menu ${isOpen[level] === menu?.title ? "show" : ""}`}
            style={{ width: 245, minWidth: 245, left: "auto", right: 0, padding: 12 }}
          >
            {menu?.child?.map((brandMenu, i) => (
              <LinkBox menu={brandMenu} onNavigate={closeMenus} key={i} />
            ))}
          </div>
        ) : menu?.mega_menu === 1 ? (
          <div className={`dropdown-menu dropdown-menu-2 ${isOpen[level] === menu?.title ? "show" : ""}`}>
            <div className="row g-4">
              {menu?.mega_menu_type === "side_banner" ? (
                <div className="col-9">
                  <div className="row g-4">
                    {menu?.child?.map((megaMenu, i) => (
                      <div className={`dropdown-column ${megaMenu?.title?.toLowerCase() === "brand list" ? "col-xl-12" : "col-xl-4"}`} key={i}>
                        <LinkBox menu={megaMenu} onNavigate={closeMenus} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                menu?.child?.map((megaMenu, i) => (
                  <div className="dropdown-column col-xl-4" key={i}>
                    <LinkBox menu={megaMenu} onNavigate={closeMenus} />
                  </div>
                ))
              )}
              <MenuMedia menu={menu} />
            </div>
          </div>
        ) : (
          ""
        )}
        {menu?.mega_menu === 1 && menu?.mega_menu_type === "link_with_image" && menu?.child?.length ? (
          <div className={`dropdown-menu dropdown-menu-2 dropdown-image  ${!isOpen.length ? "show" : isOpen[level] === menu?.title ? "show" : ""}`}>
            <div className="dropdown-column">
              {menu?.child.map((imageMenu, i) => (
                <a key={i} className="dropdown-item text-center" onClick={() => { closeMenus(); redirect(imageMenu.path); }}>
                  {imageMenu.item_image && <Image src={imageMenu.item_image ? imageMenu.item_image.original_url : LinkWithImage} className="img-fluid" alt={imageMenu.title} height={500} width={500} />}
                  <span>{t(imageMenu.title)}</span>
                </a>
              ))}
            </div>
          </div>
        ) : (
          ""
        )}
        {menu?.child && !menu.mega_menu && (
          <ul className={`dropdown-menu  ${isOpen[level] === menu.title ? "show" : ""}`}>
            {menu.child.map((childMenu, i) => (
              <MenuList menu={childMenu} key={i} isOpen={isOpen} setIsOpen={setIsOpen} closeMenus={closeMenus} level={level + 1} />
            ))}
          </ul>
        )}
      </li>
    </>
  );
};

export default MenuList;
