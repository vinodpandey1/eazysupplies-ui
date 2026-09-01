import request from "@/utils/axiosUtils";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import { useEffect, useState } from "react";
import MenuList from "./MenuList";
import { BASE_URL } from "@/utils/axiosUtils/API";
import Link from "next/link";

const MainHeaderMenu = () => {
  const [isOpen, setIsOpen] = useState([]);
  const [isClosing, setIsClosing] = useState(false);

  const closeMenus = () => {
    setIsOpen([]);
    setIsClosing(true);
  };
  const {
    data: headerMenu,
    refetch,
    isLoading,
    fetchStatus,
  } = useFetchQuery(["menu"], () => request({ url: BASE_URL + "/api/template?name=menu" }), {
    select: (res) => {
      const originalData = res.data.jsonData.data;
      const modifiedData = originalData.map((item) => ({
        ...item,
        class: `${["Product", "Mega Menu"].includes(item.title) ? 1 : 0}`,
      }));

      return modifiedData;
    },
    refetchOnWindowFocus: true,
    enabled: false,
  });

  useEffect(() => {
    isLoading && refetch();
  }, [isLoading]);

  const homeMenus = (headerMenu || []).filter((menu) => String(menu?.title || "").trim().toLowerCase() === "home");
  const remainingMenus = (headerMenu || []).filter((menu) => String(menu?.title || "").trim().toLowerCase() !== "home");

  return (
    <>
      {isLoading ? (
        <ul className="skeleton-menu navbar-nav">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      ) : (
        <ul className={`navbar-nav ${isClosing ? "menu-closing" : ""}`} onMouseEnter={() => isClosing && setIsClosing(false)}>
          {homeMenus.map((menu, i) => (
            <MenuList menu={menu} key={`home-${i}`} customClass={`${!menu?.path ? "dropdown" : ""} nav-item `} level={0} isOpen={isOpen} setIsOpen={setIsOpen} closeMenus={closeMenus} />
          ))}
          <li className="nav-item">
            <Link onClick={closeMenus} className="dropdown-item" href="/collections?layout=collection_4_grid&paginate=100">
              All Products
            </Link>
          </li>
          {remainingMenus.map((menu, i) => (
            <MenuList menu={menu} key={i} customClass={`${!menu?.path ? "dropdown" : ""} nav-item `} level={0} isOpen={isOpen} setIsOpen={setIsOpen} closeMenus={closeMenus} />
          ))}
        </ul>
      )}
    </>
  );
};

export default MainHeaderMenu;
