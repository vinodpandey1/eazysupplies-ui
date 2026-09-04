import CustomModal from "@/components/widgets/CustomModal";
import SimpleInputField from "@/components/widgets/inputFields/SimpleInputField";
import { placeHolderImage } from "@/components/widgets/Placeholder";
import ThemeOptionContext from "@/context/themeOptionsContext";
import Btn from "@/elements/buttons/Btn";
import { Form, Formik } from "formik";
import Cookies from "js-cookie";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiCloseLine } from "react-icons/ri";
import { ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import ProductPrice from "@/components/widgets/productBox/widgets/ProductPrice";

const QuestionAnswerModal = ({ modal, setModal, productState, update, refetch }) => {
  const { t } = useTranslation("common");
  const [message, setShowBoxMessage] = useState();
  const { setOpenAuthModal } = useContext(ThemeOptionContext);
  const isAuth = Cookies.get("uat");
  const toggle = () => {
    setModal((prev) => prev !== prev);
  };

  const handleClick = () => {
    setModal(false)
    // Put your logic here
  }

  useEffect(() => {
    if (message == "Unauthenticated" && !isAuth) {
      setOpenAuthModal(true);
      setModal(false);
    }
    return () => setShowBoxMessage();
  }, [message, isAuth]);

  return (
    <CustomModal modal={modal ? true : false} setModal={setModal} classes={{ modalClass: "theme-modal-2 question-answer-modal", modalHeaderClass: "p-0", customChildren: true }}>
      <ModalHeader className="border-color" toggle={toggle}>
        {t("Askaquestions")}
        <Btn className="btn-close" onClick={() => setModal(false)}>
          <RiCloseLine />
        </Btn>
      </ModalHeader>
      <ModalBody>
        <Formik
          initialValues={{
            question: update?.editData && update?.editData !== "Add" ? update?.editData?.question : "",
            product_id: productState?.product?.id,
          }}
          onSubmit={(values) => {
            handleClick();
          }}
        >
          {() => (
            <Form>
              <div className="product-review-form">
                <div className="product-wrapper">
                  <div className="product-image">{productState?.product.product_thumbnail && <Image src={productState?.product.product_thumbnail ? productState?.product.product_thumbnail.original_url : placeHolderImage} className="img-fluid" height={80} width={80} alt={productState?.product?.name} />}</div>
                  <div className="product-content">
                    <h5 className="name">{productState?.product?.name}</h5>
                    <div className="product-review-rating">
                      <div className="product-rating">
                        <ProductPrice product={productState?.product} variation={productState?.selectedVariation} className="price-number" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="review-box form-box">
                  <SimpleInputField nameList={[{ name: "question", type: "textarea", placeholder: t("EnterYourQuestions"), rows: "3", toplabel: "YourQuestions", require: "true", colprops: { xs: 12 } }]} />
                </div>
              </div>
              <ModalFooter className="p-0">
                <Btn title="Cancel" type="button" className="btn btn-outline" onClick={() => setModal(false)} />
                <Btn title="Submit" className="btn-solid" type="submit" />
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </ModalBody>
    </CustomModal>
  );
};

export default QuestionAnswerModal;
