import { ReactstrapRadio } from "@/components/widgets/reactstrapFormik";
import { Field } from "formik";
import { useTranslation } from "react-i18next";
import { Col, Label } from "reactstrap";

const ShowAddress = ({ item, type, index, setFieldValue }) => {
  const { t } = useTranslation("common");

  /** Split "address | Phone: XXXXX" */
  const parseAddress = (full) => {
    if (!full) return { address: "", phone: "" };

    const parts = full.split("| Phone:");
    return {
      address: parts[0]?.trim() ?? "",
      phone: parts[1]?.trim() ?? ""
    };
  };

  const { address, phone } = parseAddress(item.address);

  return (
    <Col xxl={6} lg={12} md={6}>
      <Label
        className="m-0 h-100"
        htmlFor={`address-${type}-${index}`}
        onClick={() => {
          setFieldValue(`${type}_address_id`, item.id);
          setFieldValue(`${type}_address`, item);
        }}
      >
        <div className="delivery-address-box">
          <div>
            <div className="form-check">
              <Field
                component={ReactstrapRadio}
                id={`address-${type}-${index}`}
                className="form-check-input"
                type="radio"
                name={`${type}_address_id`}
                value={item.id}
              />
            </div>

            <ul className="delivery-address-detail">

              {/* NAME */}
              <li>
                <h4 className="fw-semibold">{item?.name}</h4>
              </li>

              {/* CLEAN ADDRESS (NO PHONE INSIDE) */}
              <li>
                <p className="text-content">
                  <span className="text-title">{t("Address")}: </span>
                  {address}
                </p>
              </li>

              {/* PHONE (SEPARATE CLEAN VALUE) */}
              <li>
                <p className="text-content">
                  <span className="text-title">{t("Phone")}: </span>
                  {item?.country_code && `+${item?.country_code} `}
                  {item?.phone || phone}
                </p>
              </li>

              {/* CITY + ZIPCODE (CLEANED) */}
              <li>
                <p className="text-content">
                  {item?.city}, {item?.zipcode}
                </p>
              </li>

            </ul>
          </div>
        </div>
      </Label>
    </Col>
  );
};

export default ShowAddress;
