import Btn from "@/elements/buttons/Btn";
import { RegisterAPI } from "@/utils/axiosUtils/API";
import Breadcrumbs from "@/utils/commonComponents/breadcrumb";
import useCreate from "@/utils/hooks/useCreate";
import { YupObject, emailSchema, gstnSchema, nameSchema, passwordConfirmationSchema, passwordSchema, phoneSchema } from "@/utils/validation/ValidationSchema";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Col, Container, Row } from "reactstrap";

const RegisterContainer = () => {
  const [message, setMessage] = useState("");
  const { mutate, isPending } = useCreate(RegisterAPI, false, `/auth/login`, "Register Successfully", undefined, undefined, undefined, undefined, setMessage);
  const { t } = useTranslation("common");
  return (
    <>
    
      <Breadcrumbs title={"Home"} subTitle={"CreateAccount"} />
      <section className="register-page section-t-space section-b-space">
        <Container>
          <Row>
            <Col lg="12">
              <h3>{t("CreateAccount")}</h3>
              <div className="theme-card">
                <Formik
                  initialValues={{
                    name: "",
                    email: "",
                    phone: "",
                    countryCode: "91",
                    gstn: "",
                    password: "",
                    password_confirmation: "",
                  }}
                  validationSchema={YupObject({
                    name: nameSchema,
                    email: emailSchema,
                    phone: phoneSchema,
                    gstn: gstnSchema,
                    password: passwordSchema,
                    password_confirmation: passwordConfirmationSchema,
                  })}
                  onSubmit={mutate}
                >
                  {({ errors, touched, setFieldValue }) => (
                    <Form className="theme-form">
                      {message && <div className="alert alert-danger" role="alert">{message}</div>}
                      <Row className="form-row">
                        <Col md="6">
                          <label htmlFor="email">{t("FullName")}</label>
                          <Field className="form-control" name="name" type="text" id="fname" placeholder="First name" required />
                          {errors.name && touched.name && <ErrorMessage name="name" render={(msg) => <div className="invalid-feedback  d-block">{errors.name}</div>} />}
                        </Col>
                        <Col md="6">
                          <label htmlFor="email">{t("Email")}</label>
                          <Field className="form-control" name="email" type="email" id="email" placeholder="Email" required />
                          {errors.email && touched.email && <ErrorMessage name="email" render={(msg) => <div className="invalid-feedback d-block">{errors.email}</div>} />}
                        </Col>
                      </Row>
                      <Row className="form-row">
                        <Col md="6">
                          <label htmlFor="phone">{t("Phone") || "Phone Number"}</label>
                          <div className="input-group">
                            <span className="input-group-text">+91</span>
                            <Field className="form-control" name="phone" type="tel" id="phone" placeholder="10-digit phone number" maxLength="10" required />
                          </div>
                          {errors.phone && touched.phone && <ErrorMessage name="phone" render={(msg) => <div className="invalid-feedback d-block">{errors.phone}</div>} />}
                        </Col>
                        <Col md="6">
                          <label htmlFor="gstn">{t("gstn") || "GST Number"}</label>
                          <Field className="form-control" name="gstn" type="text" id="gstn" placeholder="GST number" required />
                          {errors.gstn && touched.gstn && <ErrorMessage name="gstn" render={(msg) => <div className="invalid-feedback d-block">{errors.gstn}</div>} />}
                        </Col>
                      </Row>
                      <Row className="form-row">
                        <Col md="6">
                          <label htmlFor="review">{t("Password")}</label>
                          <Field className="form-control" type="password" name="password" id="review" placeholder="Enter your password" required />
                          {errors.password && touched.password && <ErrorMessage name="password" render={(msg) => <div className="invalid-feedback d-block">{errors.password}</div>} />}
                        </Col>
                        <Col md="6">
                          <label htmlFor="review">{t("ConfirmPassword")}</label>
                          <Field className="form-control" name="password_confirmation" type="password" id="lname" placeholder="Confirm your password" required />
                          {errors.password_confirmation && touched.password_confirmation && <ErrorMessage name="password_confirmation" render={(msg) => <div className="invalid-feedback d-block">{errors.password_confirmation}</div>} />}
                        </Col>

                        <Btn loading={isPending} disabled={isPending} type="submit" className="btn-solid w-auto">
                          {t("CreateAccount")}
                        </Btn>
                      </Row>
                    </Form>
                  )}
                </Formik>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default RegisterContainer;
