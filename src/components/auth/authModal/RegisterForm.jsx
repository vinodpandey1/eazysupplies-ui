/**
 * RegisterForm Component
 * 
 * Modern registration form with Formik validation, real-time feedback, and custom success handling.
 * Features combined country code/phone input, GSTN field, password strength matching, and terms agreement.
 * 
 * Key Features:
 * - Formik form with Yup validation schemas
 * - Combined country code + phone number input
 * - Real-time field validation with visual feedback
 * - Custom success/error handlers with toast messages
 * - GSTN validation for business registration
 * - Password confirmation with matching indicator
 * - Terms & conditions checkbox with PDF link
 * - Responsive modern UI with SVG icons
 * - Auto-close modal on successful registration
 * - Loading states and disabled fields during submission
 * 
 * @returns {JSX.Element} Complete user registration form with validation
 * 
 * @developer Simran Samir
 * @version 1.0
 */
import SearchableSelectInput from "@/components/widgets/inputFields/SearchableSelectInput";
import { AllCountryCode } from "@/data/CountryCode";
import Btn from "@/elements/buttons/Btn";
import { RegisterAPI } from "@/utils/axiosUtils/API";
import useCreate from "@/utils/hooks/useCreate";
import { YupObject, emailSchema, nameSchema, passwordConfirmationSchema, passwordSchema, phoneSchema, gstnSchema } from "@/utils/validation/ValidationSchema";
import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";
import "../../../index.css";
import { tsurl } from "@/utils/constants";
const RegisterForm = ({ setState }) => {
  const [showBoxMessage, setShowBoxMessage] = useState();
  const [successMessage, setSuccessMessage] = useState(null);
  const { t } = useTranslation("common");
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const router = useRouter();

  const openLogin = () => {
    if (typeof setState === "function") {
      setState("login");
      return;
    }
    router.push("/auth/login");
  };

  // Registration and activation are separate states. Only claim that an
  // activation email was sent when the API explicitly confirms delivery.
  const handleSuccess = (resData) => {
    const response = resData?.data || {};

    if (resData?.status !== 200 && resData?.status !== 201) {
      setShowBoxMessage({
        type: "error",
        message: response?.message || response?.error || "Registration failed. Please try again.",
      });
      return;
    }

    const emailDelivery = String(response?.delivery?.email || "unknown").toLowerCase();
    const deliveryConfirmed = ["sent", "delivered", "queued"].includes(emailDelivery);
    const activationRequired = response?.activationRequired !== false;
    const submittedEmail = response?.user?.email;
    const fallbackMessage = activationRequired
      ? deliveryConfirmed
        ? "Account created. Please activate it using the link sent to your email before logging in."
        : "Account created, but activation email delivery could not be confirmed. Please contact support to resend it."
      : "Registration completed successfully. You can now log in.";

    setSuccessMessage({
      type: activationRequired && !deliveryConfirmed ? "warning" : "success",
      message: response?.message || fallbackMessage,
      activationRequired,
      deliveryConfirmed,
      emailDelivery,
      email: submittedEmail,
    });
    setShowBoxMessage(null);
  };

  // Custom error handler
  const handleError = (err) => {
    const responseData = err?.response?.data;
    const validationErrors = Array.isArray(responseData?.errors)
      ? responseData.errors
          .map((item) => item?.message || item)
          .filter(Boolean)
          .join(" ")
      : null;
    const errorMessage =
      responseData?.message ||
      responseData?.error ||
      validationErrors ||
      err?.message ||
      "Registration failed. Please try again.";

    setShowBoxMessage({
      type: 'error',
      message: errorMessage
    });
    ToastNotification("error", errorMessage);
  };

  // Modified useCreate hook with custom handlers
  const { mutate, isLoading } = useCreate(
    RegisterAPI,
    false, // updateId
    false, // path
    null, // message - set to null to prevent default SuccessHandle
    handleSuccess, // extraFunction - our custom success handler
    true, // notHandler - set to true to skip default SuccessHandle
    false, // setCouponError
    false, // refetch
    setShowBoxMessage, // error message setter
    "", // responseType
    handleError // errFunction - custom error handler
  );

  // Handle Formik submit
  const handleSubmit = (values) => {
    if (!checkboxChecked) {
      setTermsError(true);
      setShowBoxMessage({
        type: 'error',
        message: t("AgreeToTerms") || "Please agree to the terms and conditions"
      });
      return;
    }

    // Clear any previous messages
    setSuccessMessage(null);
    setShowBoxMessage(null);

    // Call the mutation
    mutate(values);
  };

  return (
    <Formik
      initialValues={{
        name: "",
        email: "",
        password: "",
        gstn: "",
        password_confirmation: "",
        country_code: "91",
        phone: "",
      }}
      validationSchema={YupObject({
        name: nameSchema,
        gstn: gstnSchema,
        email: emailSchema,
        password: passwordSchema,
        password_confirmation: passwordConfirmationSchema,
        phone: phoneSchema,
      })}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, setFieldValue, values }) => (
        <div className="register-form-container">
          {/* Success Toast Message */}
          {successMessage && (
            <div role="alert" className={`success-toast-message ${successMessage.type}`}>
              <div className="toast-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="me-2">
                  <path d={successMessage.type === "warning" ? "M11 7H13V13H11V7ZM11 15H13V17H11V15ZM12 2L1 21H23L12 2Z" : "M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"}
                    fill="currentColor" />
                </svg>
                <span>{successMessage.message}</span>
              </div>
              <button
                type="button"
                className="toast-close"
                onClick={() => setSuccessMessage(null)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                    fill="currentColor" />
                </svg>
              </button>
            </div>
          )}

          {/* Error Message */}
          {showBoxMessage && showBoxMessage.type === 'error' && (
            <div role="alert" className="login-error-message mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="me-2">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                  fill="#ef4444" />
              </svg>
              <span>{showBoxMessage.message}</span>
            </div>
          )}

          <Form>
            {/* Full Name */}
            <div className="form-group mb-4">
              <label className="form-label fw-semibold mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="me-2">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                    fill="currentColor" />
                </svg>
                {t("FullName") || "Full Name"}
              </label>
              <div className={`input-wrapper ${focusedField === 'name' || values.name ? 'filled' : ''} ${errors.name && touched.name ? 'error' : ''} ${successMessage ? 'disabled' : ''}`}>
                <Field
                  className="modern-input"
                  name="name"
                  type="text"
                  placeholder={t("FirstName") || "Enter your full name"}
                  required
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  disabled={successMessage || isLoading}
                />
                {values.name && !errors.name && !successMessage && (
                  <div className="input-icon-right">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                        fill="#4ade80" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.name && touched.name && (
                <div className="error-message">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="me-1">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                      fill="#ef4444" />
                  </svg>
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="form-group mb-4">
              <label className="form-label fw-semibold mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="me-2">
                  <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V8L12 13L20 8V18ZM12 11L4 6H20L12 11Z"
                    fill="currentColor" />
                </svg>
                {t("Email")}
              </label>
              <div className={`input-wrapper ${focusedField === 'email' || values.email ? 'filled' : ''} ${errors.email && touched.email ? 'error' : ''} ${successMessage ? 'disabled' : ''}`}>
                <Field
                  className="modern-input"
                  name="email"
                  type="text"
                  placeholder={t("Email") || "Enter your email"}
                  required
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  disabled={successMessage || isLoading}
                />
                {values.email && !errors.email && !successMessage && (
                  <div className="input-icon-right">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                        fill="#4ade80" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.email && touched.email && (
                <div className="error-message">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="me-1">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                      fill="#ef4444" />
                  </svg>
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Phone Number - Combined Country Code */}
            <div className="form-group mb-4">
              <label className="form-label fw-semibold mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="me-2">
                  <path d="M17 2H7C5.9 2 5 2.9 5 4V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V4C19 2.9 18.1 2 17 2ZM17 18H7V6H17V18ZM12 19C12.55 19 13 18.55 13 18C13 17.45 12.55 17 12 17C11.45 17 11 17.45 11 18C11 18.55 11.45 19 12 19Z"
                    fill="currentColor" />
                </svg>
                {t("Phone") || "Mobile Number"}
              </label>

              <div className="phone-input-combined">
                <div className={`phone-input-wrapper ${focusedField === 'phone' || values.phone ? 'filled' : ''} ${errors.phone && touched?.phone ? 'error' : ''} ${successMessage ? 'disabled' : ''}`}>
                  {/* Country Code Badge */}
                  <div className="country-code-badge">
                    +{values.country_code}
                  </div>

                  {/* Hidden SearchableSelectInput for country code */}
                  <div className="country-select-hidden">
                    <SearchableSelectInput
                      nameList={[
                        {
                          name: "country_code",
                          notitle: "true",
                          inputprops: {
                            name: "country_code",
                            id: "country_code",
                            options: AllCountryCode,
                            className: "country-code-select",
                            onChange: (e) => {
                              setFieldValue("country_code", e.target.value);
                            },
                            disabled: successMessage || isLoading
                          },
                        },
                      ]}
                    />
                  </div>

                  {/* Vertical Divider */}
                  <div className="input-divider"></div>

                  {/* Phone Number Input */}
                  <Field
                    className="phone-number-input"
                    name="phone"
                    placeholder={t("EnterPhoneNumber") || "Phone number"}
                    type="tel"
                    maxLength="10"
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    disabled={successMessage || isLoading}
                  />
                </div>
              </div>

              {errors.phone && touched?.phone && (
                <div className="error-message">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="me-1">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                      fill="#ef4444" />
                  </svg>
                  <span>{errors.phone}</span>
                </div>
              )}
            </div>

            {/* GST Number */}
            <div className="form-group mb-4">
              <label className="form-label fw-semibold mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="me-2">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 15.01L9.41 16.42L11 14.84V19H13V14.84L14.59 16.43L16 15.01L12.01 11L8 15.01Z"
                    fill="currentColor" />
                </svg>
                {t("gstn") || "GST Number"}
              </label>
              <div className={`input-wrapper ${focusedField === 'gstn' || values.gstn ? 'filled' : ''} ${errors.gstn && touched.gstn ? 'error' : ''} ${successMessage ? 'disabled' : ''}`}>
                <Field
                  className="modern-input"
                  name="gstn"
                  type="text"
                  placeholder={t("gstn") || "Enter GST number"}
                  required
                  onFocus={() => setFocusedField('gstn')}
                  onBlur={() => setFocusedField(null)}
                  disabled={successMessage || isLoading}
                />
                {values.gstn && !errors.gstn && !successMessage && (
                  <div className="input-icon-right">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                        fill="#4ade80" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.gstn && touched.gstn && (
                <div className="error-message">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="me-1">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                      fill="#ef4444" />
                  </svg>
                  <span>{errors.gstn}</span>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="form-group mb-4">
              <label className="form-label fw-semibold mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="me-2">
                  <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM9 6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8H9V6Z"
                    fill="currentColor" />
                </svg>
                {t("Password")}
              </label>
              <div className={`input-wrapper ${focusedField === 'password' || values.password ? 'filled' : ''} ${errors.password && touched.password ? 'error' : ''} ${successMessage ? 'disabled' : ''}`}>
                <Field
                  className="modern-input"
                  type="password"
                  name="password"
                  placeholder={t("EnterYourPassword") || "Enter your password"}
                  required
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  disabled={successMessage || isLoading}
                />
              </div>
              {errors.password && touched.password && (
                <div className="error-message">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="me-1">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                      fill="#ef4444" />
                  </svg>
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group mb-4">
              <label className="form-label fw-semibold mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="me-2">
                  <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM9 6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8H9V6ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17Z"
                    fill="currentColor" />
                </svg>
                {t("ConfirmPassword") || "Confirm Password"}
              </label>
              <div className={`input-wrapper ${focusedField === 'password_confirmation' || values.password_confirmation ? 'filled' : ''} ${errors.password_confirmation && touched.password_confirmation ? 'error' : ''} ${successMessage ? 'disabled' : ''}`}>
                <Field
                  className="modern-input"
                  name="password_confirmation"
                  type="password"
                  placeholder={t("ConfirmYourPassword") || "Confirm your password"}
                  required
                  onFocus={() => setFocusedField('password_confirmation')}
                  onBlur={() => setFocusedField(null)}
                  disabled={successMessage || isLoading}
                />
                {values.password_confirmation && !errors.password_confirmation && values.password_confirmation === values.password && !successMessage && (
                  <div className="input-icon-right">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                        fill="#4ade80" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.password_confirmation && touched.password_confirmation && (
                <div className="error-message">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="me-1">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                      fill="#ef4444" />
                  </svg>
                  <span>{errors.password_confirmation}</span>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="form-group mb-4">
              <div className={`terms-checkbox-wrapper ${termsError ? 'terms-checkbox-error' : ''}`}>
                <div className={`custom-checkbox ${checkboxChecked ? 'checked' : ''} ${termsError ? 'error' : ''} ${successMessage ? 'disabled' : ''}`}>
                  <input
                    type="checkbox"
                    id="termsCheckbox"
                    className="checkbox-input"
                    aria-invalid={termsError}
                    aria-describedby={termsError ? "termsCheckboxError" : undefined}
                    onChange={(e) => {
                      setCheckboxChecked(e.target.checked);
                      if (e.target.checked) setTermsError(false);
                    }}
                    disabled={successMessage || isLoading}
                  />
                  <label htmlFor="termsCheckbox" className="checkbox-label">
                    <div className="checkbox-icon">
                      {checkboxChecked ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                            fill="#ffffff" />
                        </svg>
                      ) : null}
                    </div>
                    <span className="checkbox-text">
                      {t("IAgreeWithTermsAndPrivacy") || "I agree with"} <a href={tsurl} target="_blank" className="terms-link">Terms & Policy</a>
                    </span>
                  </label>
                </div>
                {termsError && (
                  <div id="termsCheckboxError" className="terms-inline-error" role="alert">
                    Please accept the Terms &amp; Policy before creating your account.
                  </div>
                )}
              </div>
            </div>

            {/* Keep the server-side reason visible beside the submit action. */}
            {showBoxMessage?.type === 'error' && (
              <div role="alert" className="login-error-message mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="me-2" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                    fill="#ef4444" />
                </svg>
                <span>{showBoxMessage.message}</span>
              </div>
            )}

            {/* Submit Button */}
            <Btn
              type="submit"
              loading={isLoading}
              className="w-100 verify-btn"
              disabled={isLoading || successMessage}
            >
              {successMessage ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="me-2">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                      fill="currentColor" />
                  </svg>
                  {successMessage.type === "error" ? "Registration failed" : t("Registration Successful") || "Registration Successful!"}
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="me-2">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
                      fill="currentColor" />
                  </svg>
                  {t("CreateAccount") || "Create Account"}
                </>
              )}
            </Btn>

            {/* Keep the result visible until the user chooses the next step. */}
            {successMessage && (
              <div className="success-redirect-message mt-3">
                <div className="text-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mb-2">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                      fill="#10b981" />
                  </svg>
                  <p className="text-muted small mb-2">
                    {successMessage.activationRequired
                      ? successMessage.deliveryConfirmed
                        ? `Activation is required. Check ${successMessage.email || "your email"} for the activation link.`
                        : "Activation is required. Delivery was not confirmed, so please request help before trying to register again."
                      : "Your account is ready to use."}
                  </p>
                  <button type="button" className="btn btn-sm btn-solid" onClick={openLogin}>
                    {successMessage.activationRequired ? "Go to login after activation" : "Go to login"}
                  </button>
                </div>
              </div>
            )}
          </Form>
        </div>
      )}
    </Formik>
  );
};

export default RegisterForm;
