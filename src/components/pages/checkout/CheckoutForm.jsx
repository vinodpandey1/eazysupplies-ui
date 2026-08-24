/**
 * CheckoutForm (guest version)
 *
 * Fetches user's saved addresses (if any) and stores them into Formik
 * field `all_addresses`. Also listens for address-updated events.
 *
 * Developer: Simran Samir
 */

import AccountContext from "@/context/accountContext";
import request from "@/utils/axiosUtils";
import { GetUserAddress } from "@/utils/axiosUtils/API";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import AccountSection from "./checkoutFormData/AccountSection";
import ShippingAddressForm from "./checkoutFormData/ShippingAddressForm";

const CheckoutForm = ({ values, setFieldValue, errors }) => {
  const { accountData } = useContext(AccountContext);
  const router = useRouter();
  const userId = accountData?.data?.id;

  const {
    data: addressList,
    refetch: refetchAddresses
  } = useFetchQuery(
    ["checkoutAddresses", userId],
    () => request({ url: GetUserAddress + userId }, router),
    {
      enabled: Boolean(userId),
      refetchOnWindowFocus: false,
      select: (res) =>
        res?.data?.data?.map((addr) => ({
          id: addr.id,
          name: `${addr.name} - ${addr.address}`,
          full: {
            id: addr.id,
            name: addr.name,
            address: addr.address,
            city: addr.city,
            zipcode: addr.zipcode,
            country_code: addr.country_code || "91",
            phone: addr.phone
          }
        })),
    }
  );

  useEffect(() => {
    if (addressList) {
      setFieldValue("all_addresses", addressList);
      // default select first address if none set
      if (!values.shipping_address_id && addressList.length > 0) {
        setFieldValue("shipping_address_id", addressList[0].id);
        setFieldValue("shipping_address", addressList[0].full);
      }
    }
  }, [addressList]);

  useEffect(() => {
    const refresh = () => refetchAddresses();
    window.addEventListener("address-updated", refresh);
    return () => window.removeEventListener("address-updated", refresh);
  }, [refetchAddresses]);

  return (
    <>
      <AccountSection values={values} setFieldValue={setFieldValue} />
      <ShippingAddressForm values={values} setFieldValue={setFieldValue} data={addressList} />
    </>
  );
};

export default CheckoutForm;
