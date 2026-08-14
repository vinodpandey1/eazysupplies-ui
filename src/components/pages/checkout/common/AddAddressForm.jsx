/**
 * Checkout AddAddressForm
 *
 * FIXED:
 *  - Extract clean address + phone from merged DB format
 *  - Save back as "Address text | Phone: XXXXX"
 *  - Ensures UI never shows merged address on Checkout
 *
 * @developer Simran Samir
 */

import request from "@/utils/axiosUtils";
import { AddressAPI } from "@/utils/axiosUtils/API";
import { YupObject, nameSchema, phoneSchema } from "@/utils/validation/ValidationSchema";
import { Formik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import SelectForm from "./SelectForm";
import AccountContext from "@/context/accountContext";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";

const AddAddressForm = ({
  isLoading,
  editAddress,
  setEditAddress,
  modal,
  setModal,
  isFooterDisplay
}) => {

  const router = useRouter();
  const { t } = useTranslation("common");

  /** Get logged-in user id */
  const { accountData } = useContext(AccountContext);
  const userId = accountData?.data?.id;

  /** Reset editAddress when modal closes */
  useEffect(() => {
    if (modal !== "edit" && setEditAddress) {
      setEditAddress({});
    }
  }, [modal]);

  /**
   * Split DB stored "Address text | Phone: 9999999999"
   */
  const parseAddress = (full) => {
    if (!full) return { address: "", phone: "" };

    const parts = full.split("| Phone:");
    return {
      address: parts[0]?.trim() ?? "",
      phone: parts[1]?.trim() ?? ""
    };
  };

  const parsed = editAddress?.address ? parseAddress(editAddress.address) : {};

  return (
    <Formik
      enableReinitialize
      initialValues={{
        name: editAddress?.name || "",
        address: parsed.address || "",
        city: editAddress?.city || "",
        zipcode: editAddress?.zipcode || "",
        phone: parsed.phone || "",
        country_code: editAddress?.country_code || "91"
      }}

      validationSchema={YupObject({
        name: nameSchema,
        address: nameSchema,
        city: nameSchema,
        zipcode: nameSchema,
        phone: phoneSchema
      })}

      onSubmit={async (values) => {
        try {
          values.zipcode = values.zipcode.toString();

          /** Merge phone back to save */
          const finalAddress = `${values.address} | Phone: ${values.phone}`;

          let url = AddressAPI;
          let methodToUse = "POST";

          // ---- IF EDIT ----
          if (editAddress?.id) {
            url = `${AddressAPI}/${editAddress.id}`;
            methodToUse = "PUT";
          }

          // ---- PAYLOAD ----
          const payload = {
            name: values.name,
            address: finalAddress,       // merged format (required by backend)
            city: values.city,
            zipcode: values.zipcode
          };

          // Only for NEW address
          if (!editAddress?.id) {
            payload.userId = userId;
          }

          const response = await request(
            {
              url,
              method: methodToUse,
              data: payload
            },
            router
          );

          if (response?.response || response?.isAxiosError) {
            const message = response?.response?.data?.error || "Unable to save the address. Please try again.";
            ToastNotification("error", message);
            return;
          }

          setModal(false);

          // Trigger re-fetch on Checkout
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("address-updated"));
          }

        } catch (error) {
          console.error("Checkout address save failed:", error);
          ToastNotification("error", error?.response?.data?.error || "Unable to save the address. Please try again.");
        }
      }}
    >
      {({ values, setFieldValue }) => (
        <SelectForm
          values={values}
          setFieldValue={setFieldValue}
          setModal={setModal}
          isLoading={isLoading}
          isFooterDisplay={isFooterDisplay}
        />
      )}
    </Formik>
  );
};

export default AddAddressForm;
