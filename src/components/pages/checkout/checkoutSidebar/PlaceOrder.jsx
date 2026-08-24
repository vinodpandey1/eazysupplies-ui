import AccountContext from "@/context/accountContext";
import CartContext from "@/context/cartContext";
import Btn from "@/elements/buttons/Btn";
import { CreateOrderAPI } from "@/utils/axiosUtils/API";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";

const PlaceOrder = ({ values, addToCartData, errors }) => {
  const { t } = useTranslation("common");
  const access_token = Cookies.get("uat");
  const [disable, setDisable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionLock = useRef(false);
  const idempotencyKey = useRef(null);
  const { cartProducts, clearCart } = useContext(CartContext);
  const { accountData } = useContext(AccountContext);
  const router = useRouter();

  useEffect(() => {
    if (!accountData?.data?.id) {
      setDisable(Object.keys(errors).length > 0);
    } else {
      // console.log(values, "addresssssss")
      setDisable(!(values["shipping_address"]));
    }
  }, [access_token, values, errors]);

  const handleClick = async() => {
    if (submissionLock.current) return;
    if (!access_token && (!values?.name || !values?.email || !values?.phone)) {
      ToastNotification("error", "Please enter your name, email and phone number before placing the order.");
      return;
    }
    if (!values?.shipping_address?.address || !values?.shipping_address?.city || !values?.shipping_address?.zipcode) {
      ToastNotification("error", "Please add and select a complete shipping address before placing the order.");
      return;
    }
    // alert("llll")
    const tempProduct = []
    cartProducts?.map((data, index) => {
      tempProduct?.push({
        "productId": data?.product_id,
        "quantity": data?.quantity,
        "price": data?.product?.price
      })
    })
    // console.log(cartProducts,tempProduct, "uuuuu")

    if (!tempProduct || tempProduct.length === 0) {
      ToastNotification("warn", "Your cart is empty. Add an item before checkout.");
      return;
    }

    submissionLock.current = true;
    setIsSubmitting(true);
    idempotencyKey.current ||= globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    await axios({
      method: "POST",
      url: CreateOrderAPI,
      data: {
        userId: accountData?.data?.id,
        ...(!access_token && {
          guest: {
            name: values?.name,
            email: values?.email,
            phone: String(values?.phone || ""),
            countryCode: String(values?.country_code || "91"),
          },
        }),
        status: "PENDING",
        items: tempProduct,
        shipping: {
          address: values?.shipping_address?.address,
          city: values?.shipping_address?.city,
          state: values?.shipping_address?.state ? values?.shipping_address?.state : "NA" ,
          postalCode: values?.shipping_address?.zipcode,
          country: "India"
        },
        payment: {
          method: "CREDIT_CARD",
          status: "PENDING",
          ...(accountData?.data?.id ? { userId: accountData.data.id } : {}),
          amount: tempProduct.reduce((sum, item) => sum + Number(item?.price || 0) * Number(item?.quantity || 0), 0)
        },
        jsonData: {
          note: "First test order"
        }
      },
      headers: { "Idempotency-Key": idempotencyKey.current },
      withCredentials: true
    })
      .then(res => {
        ToastNotification("success", access_token
          ? "Order placed successfully. You can track it in My Orders."
          : `Order #${res?.data?.id} placed successfully. Confirmation has been sent to your email.`);
        clearCart();
        idempotencyKey.current = null;
        router.push(access_token ? '/account/order' : '/');
      })
      .catch(err => {
        console.log(err);
        ToastNotification("error", err?.response?.data?.error || "We couldn't place the order. Your cart is still saved; please try again.");
      })
      .finally(() => {
        submissionLock.current = false;
        setIsSubmitting(false);
      });


    // axios({
    //   method: "POST",
    //   url: CreateOrderAPI,
    //   data: {
    //     userId: accountData?.data?.id,
    //     status: "PENDING",
    //     "items": tempProduct,
    //     "shipping": {
    //       "address": values?.shipping_address?.address,
    //       "city": values?.shipping_address?.city,
    //       "state": values?.shipping_address?.city,
    //       "postalCode": values?.shipping_address?.zipcode,
    //       "country": "India"
    //     },
    //     "payment": {
    //       "method": "CREDIT_CARD",
    //       "status": "PENDING",
    //       "userId": accountData?.data?.id,
    //       "amount": tempProduct?.reduce((sum, item) => sum + item?.price, 0)
    //     },
    //     "jsonData": {
    //       "note": "First test order"
    //     }
    //   }
    // }, {withCredentials: true}).then((res) => {
    //   // console.log(res.data)
    //   alert('Order successfully placed!');
    //   clearCart()
    //   router.push('/account/order');
    // }, (err) => {
    //   alert('something went wrong, please try again');
    //   console.log(err)
    // })
  };
  return (
    <div className="text-end">
      <Btn className="order-btn" onClick={handleClick} disabled={disable || isSubmitting || cartProducts?.length === 0}>
        {isSubmitting ? "Placing order..." : t("PlaceRequest")}
      </Btn>
      {/* {addToCartData?.is_digital_only ? (
        <Btn className="order-btn" onClick={handleClick} disabled={values["billing_address_id"] && values["payment_method"] ? false : true}>
          {t("PlaceRequest")}
        </Btn>
      ) : (
        <Btn className="order-btn" onClick={handleClick} disabled={disable}>
          {t("PlaceOrder")}
        </Btn>
      )} */}
    </div>
  );
};

export default PlaceOrder;
