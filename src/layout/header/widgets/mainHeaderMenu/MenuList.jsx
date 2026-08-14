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
import { RiFolder3Line, RiHome4Line, RiPriceTag3Line } from "react-icons/ri";

const topLevelMenuIcons = {
  home: RiHome4Line,
  categories: RiFolder3Line,
  category: RiFolder3Line,
  "top brand": RiPriceTag3Line,
  brands: RiPriceTag3Line,
  brand: RiPriceTag3Line,
};

const MenuList = ({ menu, isOpen, setIsOpen, closeMenus, level }) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const redirect = (path) => {
    router.push(`/${path}`);
  };
  const isAuthenticated = Cookies.get("uat");
  const { setOpenAuthModal } = useContext(ThemeOptionContext);
  const TopLevelIcon = level === 0 ? topLevelMenuIcons[menu?.title?.trim().toLowerCase()] : null;
  const menuLabel = (
    <>
      {TopLevelIcon && <TopLevelIcon className="header-nav-icon" aria-hidden="true" />}
      <span>{t(menu.title)}</span>
    </>
  );

  const protectedRoutes = [`/account/dashboard`, `/account/notification`, `/account/wallet`, `/account/bank-details`, `/account/bank-details`, `/account/point`, `/account/refund`, `/account/order`, `/account/addresses`, `/wishlist`, `/compare`];

  const protectedRoute = (route) => {
    if (!isAuthenticated && protectedRoutes.includes(route)) {
      ToastNotification("error", "Unauthenticated");
      setOpenAuthModal(true);
    }
  };

  return (
    <>
      <li suppressHydrationWarning className={`${menu.link_type == "sub" && menu.child ? "nav-item dropdown" : "nav-item"} ${menu?.badge_text ? "new-nav-item" : ""} ${menu.mega_menu ? "dropdown-mega" : ""}`}>
        {menu.link_type === "sub" && (
          <a
            onClick={() => {
              const temp = isOpen.slice();
              temp[level] = menu.title !== temp[level] && menu.title;
              setIsOpen(temp);
            }}
            className={`nav-link dropdown-toggle ${level === 0 ? "header-nav-link-with-icon" : ""}`}
          >
            {menuLabel}
            {menu.badge_text && <label className="new-dropdown">{menu.badge_text}</label>}
          </a>
        )}

        {menu.link_type === "link" && menu.is_target_blank === 0 && (
          <Link onClick={() => { protectedRoute(menu.path); closeMenus(); }} className={`dropdown-item ${level === 0 ? "header-nav-link-with-icon" : ""} ${isOpen[level] === menu.title ? "show" : ""}`} href={`${menu.path.charAt(0) == "/" ? menu.path : `/${menu.path}`}`}>
            {menuLabel}
            {menu.badge_text && <label className={`menu-label ${menu?.badge_color ? menu?.badge_color : ""}`}>{menu?.badge_text}</label>}
          </Link>
        )}

        {menu?.is_target_blank === 1 && (
          <a onClick={closeMenus} className={`dropdown-item ${level === 0 ? "header-nav-link-with-icon" : ""} ${isOpen[level] === menu?.title ? "show" : ""}`} href={menu?.path}>
            {menuLabel}
            {menu?.badge_text && <label className={`menu-label ${menu?.badge_color ? menu?.badge_color : ""}`}>{menu?.badge_text}</label>}
          </a>
        )}
        {menu?.mega_menu === 1 ? (
          <div className={`dropdown-menu dropdown-menu-2 ${isOpen[level] === menu?.title ? "show" : ""}`}>
            <div className="row g-4">
              {menu?.mega_menu_type === "side_banner" ? (
                <div className="col-9">
                  <div className="row g-4">
                    {menu?.child?.map((megaMenu, i) => (
                      <div className="dropdown-column col-xl-4" key={i}>
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
