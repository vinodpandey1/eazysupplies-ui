import AuthModal from "@/components/auth/authModal";
import ThemeOptionContext from "@/context/themeOptionsContext";
import request from "@/utils/axiosUtils";
import { CompareAPI } from "@/utils/axiosUtils/API";
import TabFocusChecker from "@/utils/customFunctions/TabFocus";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import Cookies from "js-cookie";
import { usePathname, useSearchParams } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import { useContext, useEffect, useState } from "react";
import ExitModal from "./exitModal";
import Footers from "./footer";
import Headers from "./header";
import MobileMenu from "./header/widgets/MobileMenu";
import NewsLetterModal from "./newsLetterModal";
import RecentPurchase from "./recentPurchase";
import StickyCompare from "./stickyCompare";
import TapTop from "./tapTop";
import ThemeCustomizer from "./themeCustomizer";

const SubLayout = ({ children }) => {
  const isTabActive = TabFocusChecker();
  const { themeOption, setOpenAuthModal } = useContext(ThemeOptionContext);
  const [makeExitActive, setMakeExitActive] = useState(false);
  const path = useSearchParams();
  const theme = path.get("theme");
  const [activeStorefrontTheme, setActiveStorefrontTheme] = useState("earthling");
  const pathName = usePathname  ();
  const disableMetaTitle = ["product", "blogs", "brand"];
  const accountVerified = Cookies.get("uat");
  const authToast = Cookies.get("showAuthToast");

  const protectedRoutes = [`/account/dashboard`, `/account/notification`, `/account/wallet`, `/account/bank-details`, `/account/bank-details`, `/account/point`, `/account/refund`, `/account/order`, `/account/addresses`, `/wishlist`, `/compare`];

  useEffect(() => {
    if (!accountVerified && authToast && protectedRoutes.includes(pathName)) {
      ToastNotification("error", "Unauthenticated");
      setOpenAuthModal(true);
    }
    return () => Cookies.remove("showAuthToast");
  }, [pathName]);

  useEffect(() => {
    const selectedTheme = theme === "classic" ? "classic" : "earthling";

    Cookies.set("storefront-theme", selectedTheme, { expires: 30, sameSite: "Lax" });
    document.body.classList.toggle("earthling-reference-theme", selectedTheme === "earthling");
    setActiveStorefrontTheme(selectedTheme);

    return () => document.body.classList.remove("earthling-reference-theme");
  }, [theme]);

  useEffect(() => {
    const setThemeColors = () => {
      let newThemeColor = activeStorefrontTheme === "earthling" ? "#7a4b2a" : "#81ba00";
      let newThemeColor2 = "";
      setThemeColor(newThemeColor);
      setThemeColor2(newThemeColor2);
    };

    setThemeColors();
  }, [theme, pathName, themeOption, activeStorefrontTheme]);

  //  Setting the current url in cookies for redirection of protected routes
  useEffect(() => {
    if (typeof window !== "undefined") {
      Cookies.set("currentPath", window.location.pathname + window.location.search);
    }
  }, [pathName, path]);

  // const {
  //   data: CompareData,
  //   refetch,
  //   isLoading: getCompareLoading,
  // } = useFetchQuery(
  //   [CompareAPI],
  //   () => {
  //     if (Cookies.get("uat")) {
  //       return request({ url: CompareAPI });
  //     }
  //     return Promise.resolve(null); // Return null to avoid unnecessary loading
  //   },
  //   {
  //     enabled: false, // Initially disable fetching
  //     refetchOnWindowFocus: false,
  //     select: (res) => res?.data?.data,
  //   }
  // );

  // useEffect(() => {
  //   getCompareLoading && refetch();
  // }, [getCompareLoading]);

  const [themeColor, setThemeColor] = useState("");
  const [themeColor2, setThemeColor2] = useState("");

  useEffect(() => {
    if (themeColor) {
      document.body.style.setProperty("--theme-color", themeColor);
    }
    if (themeColor2) {
      document.body.style.setProperty("--theme-color2", themeColor2);
    } else {
      document.body.style.removeProperty("--theme-color2");
    }
  }, [themeColor, themeColor2]);

  useEffect(() => {
    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
      document.documentElement.style.removeProperty("overflow");
      document.querySelectorAll(".modal-backdrop, .offcanvas-backdrop").forEach((element) => element.remove());
    };
  }, [pathName]);

  // useEffect(() => {
  //   const message = themeOption?.general?.taglines;
  //   let timer;

  //   const updateTitle = (index) => {
  //     document.title = message[index];
  //     timer = setTimeout(() => {
  //       const nextIndex = (index + 1) % message.length;
  //       updateTitle(nextIndex);
  //     }, 500);
  //   };

  //   if (!disableMetaTitle.includes(pathName.split("/")[1].toLowerCase())) {
  //     if (!isTabActive && themeOption?.general?.exit_tagline_enable) {
  //       updateTitle(0);
  //     } else {
  //       let value = themeOption?.general?.site_title && themeOption?.general?.site_tagline ? `${themeOption?.general?.site_title} | ${themeOption?.general?.site_tagline}` : "Earthling Marketplace: Where Vendors Shine Together";
  //       document.title = value;
  //       clearTimeout(timer);
  //     }
  //   }

  //   return () => {
  //     clearTimeout(timer);
  //   };
  // }, [isTabActive, themeOption]);

  return (
    <>
      <Headers />
      {pathName?.split("/")[1].toLowerCase() != "product" && <MobileMenu />}
      {children}
      <AuthModal />
      {theme != "full_page" && <Footers />}
      <NextTopLoader showSpinner={false} />
      <RecentPurchase />
      {/* {themeOption?.popup?.news_letter?.is_enable && <NewsLetterModal setMakeExitActive={setMakeExitActive} />} */}
      {/* <div className="compare-tap-top-box">
        {CompareData?.length > 0 && <StickyCompare CompareData={CompareData} />}
        <TapTop />
      </div>
      {themeOption?.popup?.exit?.is_enable && makeExitActive && <ExitModal dataApi={themeOption?.popup?.exit} headerLogo={themeOption?.logo?.header_logo?.original_url} />} */}
    </>
  );
};

export default SubLayout;
