"use client";
import WrapperComponent from "@/components/widgets/WrapperComponent";
import AccountContext from "@/context/accountContext";
import SettingContext from "@/context/settingContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import Loader from "@/layout/loader";
import request from "@/utils/axiosUtils";
import { AddressAPI } from "@/utils/axiosUtils/API";
import Breadcrumbs from "@/utils/commonComponents/breadcrumb";
import useCreate from "@/utils/hooks/useCreate";
import { emailSchema, idCreateAccount, nameSchema, phoneSchema } from "@/utils/validation/ValidationSchema";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import { Form, Formik } from "formik";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Fragment, useContext, useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import * as Yup from "yup";
import CheckoutForm from "./CheckoutForm";
import CheckoutSidebar from "./checkoutSidebar";
import DeliveryAddress from "./DeliveryAddress";
import { useTranslation } from "react-i18next";
import AddressContext from "@/context/addressContext";
import CartContext from "@/context/cartContext";

const AddressSelectionSync = ({ accessToken, addresses, selectedShippingId, selectedBillingId, setFieldValue }) => {
  useEffect(() => {
    if (!accessToken || addresses.length === 0) return;

    const first = addresses[0];
    const formatted = {
      name: first.name,
      address: first.address,
      city: first.city,
      zipcode: first.zipcode,
      country_code: first.country_code || "91",
      phone: first.phone
    };

    if (!selectedShippingId) {
      setFieldValue("shipping_address", formatted, false);
      setFieldValue("shipping_address_id", first.id, false);
    }
    if (!selectedBillingId) {
      setFieldValue("billing_address", formatted, false);
      setFieldValue("billing_address_id", first.id, false);
    }
  }, [accessToken, addresses, selectedShippingId, selectedBillingId, setFieldValue]);

  return null;
};

const CheckoutContent = () => {
  const { accountData, refetch } = useContext(AccountContext);
  const { addressData } = useContext(AddressContext);
  const { settingData } = useContext(SettingContext);
  const { cartProducts } = useContext(CartContext);

  const [address, setAddress] = useState([]);
  const [modal, setModal] = useState("");
  const [accessToken, setAccessToken] = useState(null);

  const router = useRouter();
  const { t } = useTranslation("common");

  useEffect(() => {
    const token = Cookies.get("uat");
    setAccessToken(token);
  }, []);

  /** Logged-in user id */
  const userId = accountData?.data?.id;

  /**
   * ⭐ FIXED the API call:
   * GET /api/address?userId=3
   * NOT /api/address/3  (was causing 405 Method Not Allowed)
   */
  const {
    data: loggedAddressList,
    refetch: refetchUserAddresses
  } = useFetchQuery(
    ["checkoutLoggedInAddresses", userId],
    () => request({ url: `${AddressAPI}?userId=${userId}` }, router),
    {
      enabled: Boolean(userId),
      refetchOnWindowFocus: false,
      select: (res) => res?.data?.data ?? []
    }
  );

  /** INITIAL LOAD from context */
  useEffect(() => {
    if (addressData?.data?.length > 0) {
      setAddress([...addressData.data]);
    }
  }, [addressData]);

  /** AFTER API REFRESH */
  useEffect(() => {
    if (loggedAddressList?.length > 0) {
      setAddress([...loggedAddressList]);
    }
  }, [loggedAddressList]);

  /**
   * ⭐ MOST IMPORTANT FIX:
   * Listen for "address-updated" event from AddAddressForm
   */
  useEffect(() => {
    const refresh = () => {
      refetchUserAddresses();   // Refresh backend user address list
    };

    window.addEventListener("address-updated", refresh);

    return () => window.removeEventListener("address-updated", refresh);
  }, []);

  /**
   * Create address mutation
   */
  const { mutate, isLoading } = useCreate(
    AddressAPI,
    false,
    false,
    "Address Added successfully",
    (resDta) => {
      const saved = resDta?.data?.data || resDta?.data;
      saved?.id && setAddress((prev) => [...prev, saved]);

      refetch();
      refetchUserAddresses();

      setModal("");
    }
  );

  const addressSchema = Yup.object().shape({
    name: nameSchema,
    address: nameSchema,
    city: nameSchema,
    zipcode: nameSchema,
    country_code: nameSchema,
    phone: nameSchema
  });

  const { isLoading: themeLoad } = useContext(ThemeOptionContext);
  if (themeLoad) return <Loader />;

  return (
    <Fragment>
      <Breadcrumbs title={"Checkout"} subNavigation={[{ name: "Checkout" }]} />

      <WrapperComponent
        classes={{ sectionClass: "section-b-space checkout-section-2", fluidClass: "container" }}
        noRowCol={true}
      >
        <div className="checkout-page checkout-form">

          <Formik
            enableReinitialize={false}
            initialValues={{
              products: [],
              shipping_address_id: 0,
              billing_address_id: "",
              points_amount: "",
              wallet_balance: "",
              coupon: "",
              delivery_description: "",
              delivery_interval: "",
              payment_method: "",
              create_account: false,
              name: accountData?.data?.name ?? "",
              email: accountData?.data?.email ?? "",
              country_code: "91",
              phone: accountData?.data?.phone ?? "",
              password: "",
              shipping_address: {
                name: addressData?.data?.[0]?.name ?? "",
                address: addressData?.data?.[0]?.address ?? "",
                city: addressData?.data?.[0]?.city ?? "",
                country_code: "91",
                phone: accountData?.data?.phone ?? "",
                zipcode: addressData?.data?.[0]?.zipcode ?? ""
              },
              billing_address: {
                name: addressData?.data?.[0]?.name ?? "",
                address: addressData?.data?.[0]?.address ?? "",
                city: addressData?.data?.[0]?.city ?? "",
                country_code: "91",
                phone: accountData?.data?.phone ?? "",
                zipcode: addressData?.data?.[0]?.zipcode ?? ""
              }
            }}

            validationSchema={Yup.object().shape({
              name: nameSchema,
              email: emailSchema,
              phone: phoneSchema,
              password: idCreateAccount,
              shipping_address: addressSchema,
              billing_address: Yup.object().notRequired()
            })}

            // Placing an order is handled explicitly by PlaceOrder. The outer
            // Formik form must not also create an address or open auth when the
            // user presses Enter/clicks the order button.
            onSubmit={() => undefined}
          >
            {({ values, setFieldValue, errors }) => {
              return (
                <Form className="checkout-form">
                  <AddressSelectionSync
                    accessToken={accessToken}
                    addresses={address}
                    selectedShippingId={values.shipping_address_id}
                    selectedBillingId={values.billing_address_id}
                    setFieldValue={setFieldValue}
                  />
                  <Row className="g-sm-4 g-3">

                    {/* ------------- LEFT SIDE PANE ------------- */}
                    <Col lg="7">
                      <div className="left-sidebar-checkout">
                        <div className="checkout-detail-box">

                          {/* Guest user */}
                          {settingData?.activation?.guest_checkout && !accessToken && (
                            <div className="checkout-form-section">
                              <CheckoutForm
                                values={values}
                                setFieldValue={setFieldValue}
                                errors={errors}
                              />
                            </div>
                          )}

                          {/* Logged-in user */}
                          {accessToken && (
                            <div className="checkout-detail-box">
                              <ul>

                                {/* Shipping */}
                                {!cartProducts?.is_digital_only && (
                                  <DeliveryAddress
                                    key="shipping"
                                    type="shipping"
                                    title={"Shipping"}
                                    values={values}
                                    updateId={values["consumer_id"]}
                                    setFieldValue={setFieldValue}
                                    address={address}
                                    modal={modal}
                                    mutate={mutate}
                                    isLoading={isLoading}
                                    setModal={setModal}
                                  />
                                )}

                                {/* Billing */}
                                <DeliveryAddress
                                  key="billing"
                                  type="billing"
                                  title={"Billing"}
                                  values={values}
                                  updateId={values["consumer_id"]}
                                  setFieldValue={setFieldValue}
                                  address={address}
                                  modal={modal}
                                  mutate={mutate}
                                  isLoading={isLoading}
                                  setModal={setModal}
                                />

                              </ul>
                            </div>
                          )}

                        </div>
                      </div>
                    </Col>

                    {/* ------------- RIGHT SIDE PANE ------------- */}
                    <CheckoutSidebar
                      addToCartData={cartProducts}
                      values={values}
                      setFieldValue={setFieldValue}
                      errors={errors}
                    />

                  </Row>
                </Form>
              );
            }}
          </Formik>

        </div>
      </WrapperComponent>

    </Fragment>
  );
};

export default CheckoutContent;
