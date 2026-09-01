"use client";
import NoDataFound from "@/components/widgets/NoDataFound";
import WrapperComponent from "@/components/widgets/WrapperComponent";
import Loader from "@/layout/loader";
import request from "@/utils/axiosUtils";
import { BASE_URL, GetOrderById, GetOrderByUserId, TrackingAPI } from "@/utils/axiosUtils/API";
import Breadcrumb from "@/utils/commonComponents/breadcrumb";
import useFetchQuery from "@/utils/hooks/useFetchQuery";;
import { useRouter, useSearchParams } from "next/navigation";
import { Col, TabContent, TabPane } from "reactstrap";
import TrackOrderDetails from "./TrackOrderDetails";
import { useEffect, useState } from "react";
import axios from "axios";
import AccountSidebar from "../account/common/AccountSidebar";
import ResponsiveMenuOpen from "../account/common/ResponsiveMenuOpen";

const OrderDetailsTracking = () => {
  const search = useSearchParams();
  let orderNumber = search.get("order_number");
  let emailPhone = search.get("email_or_phone");
  const orderId = search.get("orderId");
  const [orderData, setOrderData] = useState([])
  const [taxData, setTaxData] = useState([]);
  const router = useRouter();
  const { data, isLoading, refetch: refetchOrder } = useFetchQuery([GetOrderById, orderId], () => request({ url: GetOrderById + orderId, method: "GET", withCredentials: true }, router), {
    enabled: Boolean(orderId),
    refetchOnWindowFocus: false,
    select: (res) => res?.data,
  });

   useEffect(() => {
     axios.get(BASE_URL + "/api/tax", { withCredentials: true }).then((res) => {
       setTaxData(res.data.data)
     }, (err) => {
       console.log(err)
     })
   }, [])
  if (isLoading) return <Loader />;
  return (
    <>
      <Breadcrumb title={"OrderDetails"} subNavigation={[{ name: "OrderDetails" }]} />
      <WrapperComponent classes={{ sectionClass: "dashboard-section section-b-space user-dashboard-section", fluidClass: 'container' }} customCol={true}>
        <AccountSidebar tabActive={"order"} />
        <Col lg={9}>
          <div className="faq-content">
            <div className="tab-pane">
              <ResponsiveMenuOpen />
              <Col xs={12}>
                {data ? (
                  <div className="dashboard-right-sidebar">
                    <TabContent>
                      <TabPane className="show active">
                        <TrackOrderDetails data={data} isLoading={isLoading} orderNumber={orderId} taxData={taxData} onPaymentRecorded={refetchOrder} />
                      </TabPane>
                    </TabContent>
                  </div>
                ) : (
                  <NoDataFound customClass="no-data-added" imageUrl={`/assets/svg/empty-items.svg`} title="NoOrderFound" height="300" width="300" />
                )}
              </Col>
            </div>
          </div>
        </Col>
      </WrapperComponent>
    </>
  );
};

export default OrderDetailsTracking;
