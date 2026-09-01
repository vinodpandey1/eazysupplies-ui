import NoDataFound from "@/components/widgets/NoDataFound";
import CartContext from "@/context/cartContext";
import SettingContext from "@/context/settingContext";
import Loader from "@/layout/loader";
import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { calculateCartTotals } from "@/utils/pricing/orderTotals";
import ApplyCoupon from "./ApplyCoupon";
import PlaceOrder from "./PlaceOrder";
import PointWallet from "./PointWallet";

const BillingSummary = ({ data, values, setFieldValue, isLoading, mutate, storeCoupon, setStoreCoupon, errorCoupon, appliedCoupon, setAppliedCoupon, errors }) => {
  const { convertCurrency } = useContext(SettingContext);
  const { cartProducts } = useContext(CartContext);
  const { t } = useTranslation("common");
  const { subtotal } = calculateCartTotals(cartProducts);

  useEffect(() => {
    // console.log(cartProducts, "jjj")
  }, [])
  return (
    <div className="checkout-details ">
      {cartProducts?.length > 0 ? (
        <div className="order-box">
          <div className="title-box">
            <h4>{t("BillingSummary")}</h4>
            {/* <ApplyCoupon values={values} setFieldValue={setFieldValue} data={data} storeCoupon={storeCoupon} setStoreCoupon={setStoreCoupon} errorCoupon={errorCoupon} appliedCoupon={appliedCoupon} setAppliedCoupon={setAppliedCoupon} mutate={mutate} isLoading={isLoading} /> */}
          </div>
          <div>
            <div className="custom-box-loader">
              {/* {isLoading && (
                <div className="box-loader">
                  <Loader />
                </div>
              )} */}
              <ul className="sub-total">
                <li>
                  {t("Subtotal")}
                  <span className="count">{convertCurrency(subtotal)}</span>
                </li>
                <li>
                  {t("Shipping")}
                  <span className="count">Calculated after order review</span>
                </li>
                <li>
                  {t("Tax")}
                  <span className="count checkout-review-value">Calculated after order review</span>
                </li>

                {/* <PointWallet values={values} setFieldValue={setFieldValue} data={data} /> */}
              </ul>
              <ul className="total">
                {appliedCoupon == "applied" && data?.data?.total?.coupon_total_discount ? (
                  <li className="list-total">
                    {t("YouSave")}
                    <span className="count">{data?.data?.total?.coupon_total_discount ? convertCurrency(data?.data?.total?.coupon_total_discount - data?.data?.total?.tax_total) : ""}</span>
                  </li>
                ) : null}
                <li className="list-total">
                  Estimated order value
                  <span className="count">{convertCurrency(subtotal)}</span>
                </li>
              </ul>
              <p className="checkout-pricing-note">
                Discounts, tax and the final payable total are confirmed when the order is reviewed.
              </p>
              <PlaceOrder values={values} errors={errors} />
            </div>
          </div>
        </div>
      ) : (
        <NoDataFound customClass="no-data-added" height={156} width={180} imageUrl={`/assets/svg/empty-items.svg`} title="EmptyCart" />
      )}
    </div>
  );
};

export default BillingSummary;
