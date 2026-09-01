import NavTabTitles from "@/components/widgets/NavTabs";
import AccountContext from "@/context/accountContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import { sidebarMenu } from "@/data/pages/Account";
import Btn from "@/elements/buttons/Btn";
import Loader from "@/layout/loader";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiCloseLine } from "react-icons/ri";
import { Col } from "reactstrap";
import SidebarProfile from ".";

const AccountSidebar = ({ tabActive }) => {
  const [activeTab, setActiveTab] = useState({ id: tabActive });
  const { mobileSideBar, setMobileSideBar } = useContext(AccountContext);
  const handelCallback = () => {
    setMobileSideBar(false);
  };
  const { t } = useTranslation("common");
  const { isLoading } = useContext(ThemeOptionContext);

  if (isLoading) return <Loader />;
  return (
    <Col lg={3}>
      <div className={`dashboard-sidebar ${mobileSideBar ? "open" : ""}`}>
        <Btn color="transparent" className="back-btn" onClick={handelCallback}>
          <RiCloseLine />
          <span>{t("Close")}</span>
        </Btn>
        <SidebarProfile />
        <div className="faq-tab">
          <NavTabTitles classes={{ navClass: "nav nav-tabs" }} setActiveTab={setActiveTab} activeTab={activeTab} titleList={sidebarMenu} isLogout callBackFun={handelCallback} />
        </div>
      </div>
    </Col>
  );
};

export default AccountSidebar;
