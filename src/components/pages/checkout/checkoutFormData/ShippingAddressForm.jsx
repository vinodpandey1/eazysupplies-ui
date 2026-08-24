/**
 * ShippingAddressForm (Checkout)
 * Backend stores "address | Phone: XXXXX", so we split into clean fields.
 *
 * @developer Simran Samir
 */

import SimpleInputField from "@/components/widgets/inputFields/SimpleInputField";
import { AllCountryCode } from "@/data/CountryCode";
import SearchableSelectInput from "@/utils/commonComponents/inputFields/SearchableSelectInput";
import { useTranslation } from "react-i18next";
import { Col, Row } from "reactstrap";

const ShippingAddressForm = ({ values, setFieldValue, data }) => {
  const { t } = useTranslation("common");

  /** Split "address | Phone: XXXXX" */
  const extractAddress = (storedAddress) => {
    if (!storedAddress) return { address: "", phone: "" };

    const [addressPart, phonePart] = storedAddress.split("| Phone:");

    return {
      address: addressPart?.trim() ?? "",
      phone: phonePart?.trim() ?? ""
    };
  };

  /** On selecting a saved address from dropdown */
  const handleSelectAddress = (opt) => {
    const full = opt.full;

    const { address, phone } = extractAddress(full?.address);

    setFieldValue("shipping_address_id", opt.id);

    // Cleanly set field values
    setFieldValue("shipping_address.name", full?.name || "");
    setFieldValue("shipping_address.address", address);
    setFieldValue("shipping_address.phone", full?.phone || phone);
    setFieldValue("shipping_address.city", full?.city || "");
    setFieldValue("shipping_address.zipcode", full?.zipcode || "");
    setFieldValue("shipping_address.country_code", full?.country_code || "91");
  };

  return (
    <div className="checkbox-main-box">
      <div className="checkout-title1">
        <h2>{t("ShippingDetails")}</h2>
      </div>

      <Row className="checkout-form g-md-4 g-sm-3 g-2">

        {/* -------- Saved Address Dropdown -------- */}
        {data?.length > 0 && (
          <SearchableSelectInput
            nameList={[
              {
                name: "shipping_address_id",
                title: "Your Address",
                toplabel: "Your Addresses",
                colprops: { xs: 12 },
                inputprops: {
                  name: "shipping_address_id",
                  id: "shipping_address_id",
                  options: data,
                },
                store: "obj",
                setvalue: (_fieldName, option) => handleSelectAddress(option),
              }
            ]}
          />
        )}

        {/* -------- Address Type -------- */}
        <SimpleInputField
          nameList={[
            {
              name: "shipping_address.name",
              placeholder: t("EnterAddressType"),
              toplabel: "Address Type",
              colprops: { xs: 12 },
              require: "true"
            }
          ]}
        />

        {/* -------- CLEAN Address (NO PHONE) -------- */}
        <SimpleInputField
          nameList={[
            {
              name: "shipping_address.address",
              placeholder: t("EnterAddress"),
              toplabel: "Address",
              colprops: { xs: 12 },
              require: "true"
            }
          ]}
        />

        {/* -------- Phone (separate clean line) -------- */}
        <Col xs={12}>
          <Row className="g-2">

            {/* Country Code */}
            <Col xs={4}>
              <SearchableSelectInput
                nameList={[
                  {
                    name: "shipping_address.country_code",
                    label: "Code",
                    toplabel: "Code",
                    inputprops: {
                      name: "shipping_address.country_code",
                      id: "shipping_address.country_code",
                      options: AllCountryCode,
                      defaultValue: "91"
                    }
                  }
                ]}
              />
            </Col>

            {/* Phone */}
            <Col xs={8}>
              <SimpleInputField
                nameList={[
                  {
                    name: "shipping_address.phone",
                    type: "number",
                    placeholder: t("EnterPhoneNumber"),
                    toplabel: "Phone",
                    colprops: { xs: 12 },
                    require: "true"
                  }
                ]}
              />
            </Col>

          </Row>
        </Col>

        {/* -------- City + Zipcode (Combined Line Below Phone) -------- */}
        <SimpleInputField
          nameList={[
            {
              name: "shipping_address.city",
              placeholder: t("EnterCity"),
              toplabel: "City",
              colprops: { md: 6 },
              require: "true"
            },
            {
              name: "shipping_address.zipcode",
              placeholder: t("EnterPincode"),
              toplabel: "Pincode",
              colprops: { md: 6 },
              require: "true"
            }
          ]}
        />

      </Row>
    </div>
  );
};

export default ShippingAddressForm;
