"use client";
import WrapperComponent from "@/components/widgets/WrapperComponent";
import Breadcrumb from "@/utils/commonComponents/breadcrumb";
import { Col, TabPane } from "reactstrap";
import ResponsiveMenuOpen from "../common/ResponsiveMenuOpen";
import MyOrders from "./MyOrders";
import AccountContext from "@/context/accountContext";
import { useContext } from "react";
import AccountSidebar from "../common/AccountSidebar";

const AccountOrders = () => {
  const { accountData } = useContext(AccountContext);
  const userId = accountData?.data?.id;
  return (
    <>
      <Breadcrumb title={"Order"} subNavigation={[{ name: "Order" }]} />
      <WrapperComponent classes={{ sectionClass: "dashboard-section section-b-space user-dashboard-section", fluidClass: "container" }} customCol={true}>
        <AccountSidebar tabActive={"order"} />
        <Col xxl={9} lg={8}>
          <div className="faq-content">
            <div className="tab-content">
              <ResponsiveMenuOpen />
              <TabPane className="show fade active">
                {userId != undefined && <MyOrders userId={userId} />}
              </TabPane>
            </div>
          </div>
        </Col>
      </WrapperComponent>
    </>
  );
};

export default AccountOrders;
