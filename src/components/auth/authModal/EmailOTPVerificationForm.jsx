/**
 * EmailOTPVerificationForm Component
 * 
 * OTP verification and password reset form for forgot password flow.
 * 
 * @developer Simran Samir
 * @version 1.0
 */
import Btn from "@/elements/buttons/Btn";
import useEmailOtpVerification from "@/utils/hooks/useEmailOtpVerification";
import { BASE_URL } from "@/utils/axiosUtils/API";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "reactstrap";
import "../../../index.css";

const EmailOTPVerificationForm = ({ setState, setShowBoxMessage }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [emailAddress, setEmailAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { t } = useTranslation("common");
  const otpRefs = useRef([]);
  const passwordRef = useRef(null);
  
  const { mutate: verifyOTPAndUpdatePassword, isLoading } = useEmailOtpVerification(setState, setShowBoxMessage);

  // Calculate values on the fly - NO STATE for these
  const isOtpComplete = otp.every(digit => digit !== "");
  const passwordsMatch = password && confirmPassword ? password === confirmPassword : false;

  // Get email from cookies - RUNS ONCE
  useEffect(() => {
    const savedEmail = document.cookie
      .split('; ')
      .find(row => row.startsWith('email='))
      ?.split('=')[1];
    
    if (savedEmail) {
      setEmailAddress(decodeURIComponent(savedEmail));
    }
  }, []);

  // Countdown timer - ONLY depends on countdown
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown]);

  // Focus first OTP input - RUNS ONCE
  useEffect(() => {
    if (otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, []);

  const validatePassword = () => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordError("Must include at least one uppercase letter");
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setPasswordError("Must include at least one number");
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = () => {
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      setOtpError("Please enter complete 6-digit OTP");
      return;
    }
    
    if (!validatePassword()) {
      return;
    }
    
    verifyOTPAndUpdatePassword({ 
      otp: otpString,
      password: password,
      email: emailAddress 
    });
  };

  const handleResendOTP = async () => {
    if (countdown === 0 && emailAddress) {
      try {
        const response = await fetch(
          `${BASE_URL}/api/auth/password-reset`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "request", email: emailAddress, audience: "customer" }),
          }
        );
        
        if (response.ok) {
          setCountdown(30);
          setOtp(new Array(6).fill(""));
          setOtpError("");
          if (otpRefs.current[0]) {
            otpRefs.current[0].focus();
          }
          setShowBoxMessage({ 
            type: 'success', 
            message: 'OTP resent successfully!' 
          });
        }
      } catch (error) {
        console.error("Failed to resend OTP:", error);
      }
    }
  };

  const handleOTPChange = (element, index) => {
    const value = element.value;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').split("").slice(0, 6);
      digits.forEach((digit, idx) => {
        if (idx + index < 6) newOtp[idx + index] = digit;
      });
      setOtp(newOtp);
      
      const lastIndex = Math.min(index + digits.length - 1, 5);
      if (otpRefs.current[lastIndex]) {
        otpRefs.current[lastIndex].focus();
      }
    } else {
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value && index < 5) {
        otpRefs.current[index + 1].focus();
      }
    }

    // Clear OTP error when user starts typing
    if (otpError) {
      setOtpError("");
    }
    
    // Also clear any global error messages about OTP
    if (setShowBoxMessage) {
      setShowBoxMessage(null);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        otpRefs.current[index - 1].focus();
      }
    }
    if (e.key === "Enter" && isOtpComplete && passwordRef.current) {
      passwordRef.current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;
    
    const pasteArray = pasteData.split("");
    const newOtp = [...otp];
    
    pasteArray.forEach((digit, idx) => {
      if (idx < 6) newOtp[idx] = digit;
    });
    
    setOtp(newOtp);
    
    const lastIndex = Math.min(pasteArray.length - 1, 5);
    if (otpRefs.current[lastIndex]) {
      otpRefs.current[lastIndex].focus();
    }
  };

  const isFormValid = () => {
    return isOtpComplete && 
           password.length >= 8 && 
           /[A-Z]/.test(password) &&
           /[0-9]/.test(password) &&
           password === confirmPassword &&
           !isLoading;
  };

  // Password strength indicator - pure function, no state
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="auth-form-box">
      {/* Simple Email Display */}
      <div className="text-center mb-4">
        <p className="text-muted mb-1" style={{ fontSize: '13px' }}>
          Verification code sent to
        </p>
        <p className="fw-semibold text-primary" style={{ fontSize: '14px', wordBreak: 'break-all' }}>
          {emailAddress || 'your email'}
        </p>
      </div>

      {/* OTP Section */}
      <div className="mb-3">
        <label className="form-label fw-semibold mb-2" style={{ fontSize: '14px' }}>
          Enter Verification Code
          <span className="text-danger ms-1">*</span>
        </label>
        <div className="otp-container" onPaste={handlePaste}>
          <div className="otp-input-wrapper" style={{ gap: '6px' }}>
            {[...Array(6)].map((_, index) => (
              <div key={index} style={{ flex: 1 }}>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="1"
                  className={`otp-digit ${otp[index] ? 'filled' : ''} ${otpError ? 'error' : ''}`}
                  value={otp[index]}
                  onChange={(e) => handleOTPChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  ref={(ref) => (otpRefs.current[index] = ref)}
                  disabled={isLoading}
                  autoComplete="one-time-code"
                  style={{ 
                    height: '48px', 
                    fontSize: '20px',
                    borderRadius: '8px'
                  }}
                />
              </div>
            ))}
          </div>
          {otpError && (
            <div className="mt-1" style={{ color: '#ef4444', fontSize: '12px' }}>
              <span>{otpError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Password Section */}
      <div className="mb-3">
        <label className="form-label fw-semibold mb-2" style={{ fontSize: '14px' }}>
          Set New Password
          <span className="text-danger ms-1">*</span>
        </label>
        
        {/* New Password */}
        <div className="mb-2">
          <div className="password-input-container">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                // Clear password error when typing
                if (passwordError) setPasswordError("");
              }}
              onBlur={() => validatePassword()}
              placeholder="New password"
              disabled={isLoading}
              innerRef={passwordRef}
              className="password-input"
              style={{ 
                height: '42px', 
                paddingRight: '40px',
                fontSize: '14px'
              }}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              style={{ right: '10px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                {showPassword ? (
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                ) : (
                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-4 .7l2.17 2.17C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                )}
              </svg>
            </button>
          </div>
          
          {/* Password strength indicator */}
          {password && (
            <div className="d-flex align-items-center mt-1" style={{ gap: '8px' }}>
              <div className="d-flex" style={{ gap: '4px' }}>
                {[1, 2, 3, 4].map((level) => (
                  <div 
                    key={level}
                    style={{
                      width: '22px',
                      height: '3px',
                      borderRadius: '2px',
                      backgroundColor: passwordStrength >= level 
                        ? level <= 1 ? '#ef4444' : level === 2 ? '#f59e0b' : level === 3 ? '#3b82f6' : '#10b981'
                        : '#e2e8f0'
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                {passwordStrength === 0 ? 'Very Weak' : 
                 passwordStrength === 1 ? 'Weak' : 
                 passwordStrength === 2 ? 'Fair' : 
                 passwordStrength === 3 ? 'Good' : 'Strong'}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password with Match Indicator */}
        <div className="mb-2">
          <div className="password-input-container">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                // Clear password error when typing
                if (passwordError) setPasswordError("");
              }}
              onBlur={() => validatePassword()}
              placeholder="Confirm password"
              disabled={isLoading}
              className={`password-input ${confirmPassword && password !== confirmPassword ? 'mismatch' : ''} ${passwordsMatch && confirmPassword ? 'match' : ''}`}
              style={{ 
                height: '42px', 
                paddingRight: '40px',
                fontSize: '14px'
              }}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ right: '10px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                {showConfirmPassword ? (
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                ) : (
                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-4 .7l2.17 2.17C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                )}
              </svg>
            </button>
            
            {/* Password Match Indicator Icon */}
            {confirmPassword && (
              <div style={{ 
                position: 'absolute', 
                right: '40px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center'
              }}>
                {passwordsMatch ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#10b981">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#94a3b8">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                  </svg>
                )}
              </div>
            )}
          </div>
          
          {/* Visual match feedback */}
          {confirmPassword && password && (
            <div className="mt-1" style={{ 
              fontSize: '11px', 
              color: passwordsMatch ? '#10b981' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {passwordsMatch ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#10b981">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                  <span>Passwords match</span>
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <span>Passwords do not match</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Password Error Message */}
        {passwordError && (
          <div className="mt-1" style={{ color: '#ef4444', fontSize: '12px' }}>
            <span>{passwordError}</span>
          </div>
        )}
      </div>

      {/* Update Password Button */}
      <Btn
        type="button"
        loading={isLoading}
        className="w-100 mb-3"
        onClick={handleSubmit}
        disabled={!isFormValid()}
        style={{
          background: 'linear-gradient(135deg, #4361ee, #3a56d4)',
          border: 'none',
          color: 'white',
          fontWeight: '600',
          padding: '10px 20px',
          borderRadius: '8px',
          height: '44px',
          fontSize: '15px',
          opacity: !isFormValid() ? '0.6' : '1'
        }}
      >
        {isLoading ? 'Updating...' : 'Update Password'}
      </Btn>

      {/* Resend OTP */}
      <div className="text-center mb-3">
        {countdown > 0 ? (
          <div style={{ fontSize: '13px' }}>
            <span className="text-muted">Didn't receive code? </span>
            <span style={{ color: '#4361ee', fontWeight: '600' }}>Resend in {countdown}s</span>
          </div>
        ) : (
          <button
            type="button"
            className="resend-btn"
            onClick={handleResendOTP}
            disabled={isLoading}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#4361ee',
              fontSize: '13px',
              fontWeight: '500',
              padding: '6px 12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? '0.6' : '1'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="me-1">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" 
                    fill="#4361ee"/>
            </svg>
            Resend Code
          </button>
        )}
      </div>

      {/* Back to Login */}
      <div className="text-center pt-2 border-top">
        <button
          type="button"
          className="back-to-login-btn"
          onClick={() => setState("login")}
          disabled={isLoading}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            fontSize: '13px',
            padding: '8px 12px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? '0.6' : '1'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="me-1">
            <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" 
                  fill="#6c757d"/>
          </svg>
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default EmailOTPVerificationForm;
