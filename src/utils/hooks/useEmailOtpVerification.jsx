/**
 * useEmailOtpVerification Custom Hook
 * 
 * Handles OTP verification and password update for forgot password flow.
 * 
 * @param {Function} setState - Parent state updater (emailOtp → login)
 * @param {Function} setShowBoxMessage - UI message display callback
 * @returns {Object} React Query mutation for OTP verification and password update
 * @developer Simran Samir
 * @version 1.0
 */
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import AccountContext from "@/context/accountContext";
import CartContext from "@/context/cartContext";
import CompareContext from "@/context/compareContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import WishlistContext from "@/context/wishlistContext";
import { CompareAPI, SyncCart, BASE_URL } from "../axiosUtils/API";
import useCreate from "./useCreate";

const useEmailOtpVerification = (setState, setShowBoxMessage) => {
  const { setOpenAuthModal } = useContext(ThemeOptionContext);
  const { mutate } = useCreate(SyncCart, false, false, "No");
  const { addToWishlist } = useContext(WishlistContext);
  const { mutate: compareCartMutate } = useCreate(CompareAPI, false, false, "Added to Compare List");
  const { refetch } = useContext(AccountContext);
  const { refetch: cartRefetch } = useContext(CartContext);
  const { refetch: compareRefetch } = useContext(CompareContext);
  const router = useRouter();
  
  const CallBackUrl = Cookies.get("CallBackUrl") ? Cookies.get("CallBackUrl") : "/account/dashboard";
  
  return useMutation({
    mutationFn: async (data) => {
      const email = data.email || Cookies.get("email");
      const { otp, password } = data;
      
      if (!email) {
        throw new Error("Email address not found. Please try again.");
      }

      if (!otp) {
        throw new Error("OTP is required.");
      }
      
      if (!password) {
        throw new Error("New password is required.");
      }
      
      const response = await fetch(`${BASE_URL}/api/auth/password-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "reset", email, otp, password, audience: "customer" }),
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        if (responseText.includes('<!DOCTYPE html>')) {
          throw new Error("Unable to connect to server. Please try again later.");
        }
        console.error("Failed to parse response:", responseText);
        throw new Error("Server error. Please try again.");
      }
      
      return {
        status: response.status,
        data: responseData,
        ok: response.ok,
      };
    },
    onSuccess: (responseData) => {
      if (responseData.status === 200 || responseData.status === 201 || responseData.ok) {
        // Clean up - remove email cookie
        Cookies.remove("email");
        
        // Show success message
        if (setShowBoxMessage && typeof setShowBoxMessage === 'function') {
          setShowBoxMessage({
            type: 'success',
            message: responseData.data?.message || 'Password updated successfully! Please login with your new password.'
          });
        }
        
        // Navigate to login page after success
        setTimeout(() => {
          if (setState && typeof setState === 'function') {
            setState("login");
          }
        }, 1500);
        
      } else {
        // Get the raw error message from backend
        const rawErrorMsg = responseData.data?.message || responseData.data?.error || "";
        let errorMsg = "";
        
        // SPECIFIC OTP ERROR HANDLING - This is what you need!
        if (rawErrorMsg.toLowerCase().includes('invalid otp') || 
            rawErrorMsg.toLowerCase().includes('wrong otp') ||
            rawErrorMsg.toLowerCase().includes('incorrect otp') ||
            rawErrorMsg.toLowerCase().includes('otp invalid') ||
            rawErrorMsg.toLowerCase().includes('otp does not match') ||
            rawErrorMsg.toLowerCase().includes('verification code invalid') ||
            rawErrorMsg.toLowerCase().includes('wrong verification code')) {
          
          errorMsg = "Invalid verification code. Please check and try again.";
          
        } 
        // OTP Expired
        else if (rawErrorMsg.toLowerCase().includes('expired') || 
                 rawErrorMsg.toLowerCase().includes('otp expired') ||
                 rawErrorMsg.toLowerCase().includes('code expired')) {
          
          errorMsg = "Verification code has expired. Please request a new one.";
          
        }
        // User not found
        else if (rawErrorMsg.toLowerCase().includes('user not found') || 
                 rawErrorMsg.toLowerCase().includes('does not exist')) {
          
          errorMsg = "Account not found. Please check your email or create a new account.";
          
        }
        // Too many attempts
        else if (rawErrorMsg.toLowerCase().includes('too many attempts') || 
                 rawErrorMsg.toLowerCase().includes('too many requests')) {
          
          errorMsg = "Too many failed attempts. Please try again after 15 minutes.";
          
        }
        // Password related errors
        else if (rawErrorMsg.toLowerCase().includes('weak password')) {
          errorMsg = "Password is too weak. Please choose a stronger password.";
        }
        else if (rawErrorMsg.toLowerCase().includes('password same as old')) {
          errorMsg = "New password must be different from your old password.";
        }
        else {
          // Only show generic error for truly unknown issues
          errorMsg = rawErrorMsg || "Failed to update password. Please try again.";
  
          if (errorMsg.toLowerCase().includes('internal server error')) {
            errorMsg = "Unable to process your request. Please try again later.";
          }
        }
        
        console.error("Password update failed:", rawErrorMsg);
        
        if (setShowBoxMessage && typeof setShowBoxMessage === 'function') {
          setShowBoxMessage({
            type: 'error',
            message: errorMsg
          });
        }
      }
    },
    onError: (error) => {
      console.error("DEBUG: Password Update Error:", error);
      
      // Handle network errors vs other errors
      let errorMsg = error.message || "Failed to update password. Please try again.";
      
      if (errorMsg.includes('fetch') || errorMsg.includes('network') || errorMsg.includes('connection')) {
        errorMsg = "Network error. Please check your internet connection.";
      }
      else if (errorMsg.includes('timeout')) {
        errorMsg = "Request timed out. Please try again.";
      }
      
      if (setShowBoxMessage) {
        setShowBoxMessage({
          type: 'error',
          message: errorMsg
        });
      }
    }
  });
};

export default useEmailOtpVerification;
