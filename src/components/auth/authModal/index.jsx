/**
 * AuthModal Component
 * 
 * Unified authentication modal supporting multiple login/registration flows.
 * Central hub for email login, phone OTP, GST login, registration, and password recovery.
 * 
 * Key Features:
 * - Dynamic state management for 6 auth flows: login, register, forgot, otp, number, gst
 * - State-specific icons, titles, and descriptions
 * - Toggle between registration and login modes
 * - Alternative login methods (GST, Mobile)
 * - Responsive modal with consistent design language
 * - Internationalization support for all states
 * - Seamless transition between authentication steps
 * 
 * @returns {JSX.Element} Multi-state authentication modal container
 * 
 * @developer Simran Samir
 * @version 1.0
 */
import ThemeOptionContext from "@/context/themeOptionsContext";
import Btn from "@/elements/buttons/Btn";
import { Href } from "@/utils/constants";
import Cookies from "js-cookie";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiSmartphoneLine, RiBuildingLine, RiMailLine, RiLockLine, RiUserLine, RiShieldUserLine } from "react-icons/ri";
import { Modal, ModalBody } from "reactstrap";
import ForgotPasswordForm from "./ForgotPasswordForm";
import LoginForm from "./LoginForm";
import OTPVerificationForm from "./OTPVerificationForm";
import EmailOTPVerificationForm from "./EmailOTPVerificationForm";
import NumberLoginForm from "./phnLogin/LoginForm";
import RegisterForm from "./RegisterForm";
import GSTLoginForm from "./gstLogin/GSTLoginForm";
import "../../../index.css";

const AuthModal = () => {
  const [state, setState] = useState("login");
  const [title, setTitle] = useState("Sign in");
  const [description, setDescription] = useState("");
  const [showBoxMessage, setShowBoxMessage] = useState(null); // ADD THIS STATE
  
  const { t } = useTranslation("common");
  const { openAuthModal, setOpenAuthModal, themeOption } = useContext(ThemeOptionContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEarthlingTheme = searchParams.get("theme") !== "classic";

  const handleClick = () => {
    if (state === "register") {
      setState("login");
    } else {
      setState("register");
    }
  };

  const handleAlternativeLoginClick = (type) => {
    setState(type);
  };

  useEffect(() => {
    // Set title based on state
    if (state === "forgot") {
      setTitle("ForgotPassword");
    } else if (state === "otp") {
      setTitle("EnterVerificationCode");
    } else if (state === "emailOtp") {
      setTitle("EmailVerificationCode"); // New title for email OTP
    } else if (state === "register") {
      setTitle("CreateAccount");
    } else if (state === "number") {
      setTitle("LoginWithNumber");
    } else if (state === "gst") {
      setTitle("LoginWithGST");
    } else {
      setTitle("SignIn");
    }

    // Set description based on state
    if (state === "otp") {
      setDescription(t("OtpDescription") || "Enter the verification code sent to your phone");
    } else if (state === "emailOtp") {
      setDescription(t("EmailOtpDescription") || "Enter the verification code sent to your email"); // New description
    } else if (state === "number") {
      setDescription(t("NumberLoginDescription") || "Enter your mobile number to continue");
    } else if (state === "gst") {
      setDescription(t("GSTLoginDescription") || "Enter your GST details to continue");
    } else if (state === "forgot") {
      setDescription(t("ForgotPasswordDescription") || "Enter your email to reset your password");
    } else if (state === "register") {
      setDescription(t("RegisterDescription") || "Create your account to get started");
    } else {
      setDescription(t("AuthModalDescription") || "Sign in to your account to continue");
    }
  }, [state, t]);

  // Get state icon based on current state
  const getStateIcon = () => {
    switch(state) {
      case "otp":
      case "emailOtp": // Both OTP states can use same icon
        return <RiShieldUserLine />;
      case "number":
        return <RiSmartphoneLine />;
      case "gst":
        return <RiBuildingLine />;
      case "forgot":
        return <RiLockLine />;
      case "register":
        return <RiUserLine />;
      default:
        return <RiMailLine />;
    }
  };

  return (
    <Modal 
      toggle={() => setOpenAuthModal(false)} 
      className={`auth-modal modal-dialog-centered fade show ${isEarthlingTheme ? "earthling-auth-modal" : ""}`}
      isOpen={openAuthModal}
      size="md"
    >
      <div className="modal-dialog">
        <div className="modal-content compact-auth-modal">
          <button 
            type="button" 
            className="btn-close auth-modal-close" 
            onClick={() => setOpenAuthModal(false)}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" 
                    fill="currentColor"/>
            </svg>
          </button>
          
          <ModalBody className="p-4">
            <div className="auth-modal-content">
              {/* Modern Header with Icon */}
              <div className="text-center mb-4">
                <div className="auth-state-icon">
                  {getStateIcon()}
                </div>
                <h3 className="fw-bold mb-2">{t(title)}</h3>
                <p className="text-muted small mb-0">
                  {description}
                </p>
              </div>

              {/* Show message if exists */}
              {showBoxMessage && (
                <div className={`alert alert-${showBoxMessage.type} mb-4`} role="alert">
                  {showBoxMessage.message}
                </div>
              )}

              {/* Dynamic form rendering based on state */}
              <div className="auth-forms-container">
                {state === "register" && <RegisterForm setState={setState} />}
                {state === "login" && <LoginForm setState={setState} />}
                {state === "forgot" && <ForgotPasswordForm setState={setState} setShowBoxMessage={setShowBoxMessage} />}
                {state === "otp" && <OTPVerificationForm setState={setState} setShowBoxMessage={setShowBoxMessage} />}
                {state === "emailOtp" && <EmailOTPVerificationForm setState={setState} setShowBoxMessage={setShowBoxMessage} />}
                {state === "number" && <NumberLoginForm setState={setState} />}
                {state === "gst" && <GSTLoginForm setState={setState} />}
              </div>

              {/* Show additional options for non-forgot/OTP states */}
              {state !== "forgot" && state !== "otp" && state !== "emailOtp" && (
                <div className="auth-options mt-4">
                  {/* Divider */}
                  {state !== "register" && (
                    <div className="divider my-4">
                      <span className="divider-text">{t("OR") || "Or continue with"}</span>
                    </div>
                  )}

                  {/* Toggle between login/register */}
                  <div className="text-center">
                    <p className="auth-toggle-text mb-0">
                      {state === "register" 
                        ? t("Alreadyhaveanaccount") || "Already have an account?" 
                        : t("Don'thaveanaccount") || "Don't have an account?"
                      }{" "}
                      <button 
                        type="button" 
                        className="auth-toggle-btn" 
                        onClick={handleClick}
                      >
                        {state === "register" 
                          ? t("Login") || "Sign in" 
                          : t("Register") || "Create account"
                        }
                      </button>
                    </p>
                  </div>

                  {/* Alternative login methods (only shown in main login state) */}
                  {state === "login" && (
                    <div className="alternative-login mt-3">
                      <button
                        type="button"
                        className="alt-login-btn mb-2"
                        onClick={() => handleAlternativeLoginClick("gst")}
                      >
                        <RiBuildingLine className="me-2" />
                        <span>{t("LoginWithGSTNumber") || "Continue with GST"}</span>
                      </button>
                      
                      <button
                        type="button"
                        className="alt-login-btn"
                        onClick={() => handleAlternativeLoginClick("number")}
                      >
                        <RiSmartphoneLine className="me-2" />
                        <span>{t("LoginWithNumber") || "Continue with Mobile"}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ModalBody>
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
