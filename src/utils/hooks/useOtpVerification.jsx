/**
 * useOtpVerification Custom Hook
 * 
 * Handles OTP verification and post-login flow for phone authentication.
 * Manages token storage, cart/wishlist sync, context updates, and user redirection.
 * Replicates email login behavior exactly for consistent user experience.
 * 
 * Key Responsibilities:
 * - Verifies OTP via API call
 * - Sets authentication cookies matching email login structure
 * - Synchronizes cart, wishlist, and compare data
 * - Updates all application contexts (Account, Cart, Compare, Wishlist)
 * - Handles user redirection based on CallBackUrl
 * - Cleans up temporary authentication cookies
 * - Provides comprehensive debugging throughout the flow
 * 
 * @param {Function} setState - Parent state updater (phone → otp → loggedIn)
 * @param {Function} setShowBoxMessage - UI message display callback
 * @returns {Object} React Query mutation for OTP verification
 * 
 * @developer Simran Samir
 * @version 1.0
 */

import AccountContext from "@/context/accountContext";
import CartContext from "@/context/cartContext";
import CompareContext from "@/context/compareContext";
import ThemeOptionContext from "@/context/themeOptionsContext";
import WishlistContext from "@/context/wishlistContext";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import request from "../axiosUtils";
import { CompareAPI, SyncCart, VerifyTokenAPI } from "../axiosUtils/API";
import useCreate from "./useCreate";
import { BASE_URL } from "@/utils/axiosUtils/API";

const LoginWithMobileHandle = (responseData, router, refetch, compareRefetch, CallBackUrl, mutate, cartRefetch, setShowBoxMessage, addToWishlist, compareCartMutate, setOpenAuthModal, setState) => {
  console.log("DEBUG LoginWithMobileHandle: Response received", responseData);
  
  if (responseData.status === 200 || responseData.status === 201) {
    // SET COOKIES EXACTLY LIKE EMAIL LOGIN
    // The API cookie is HttpOnly and belongs to api.eazysupplies.com, so the
    // storefront must use the access token returned in the login response.
    const authToken = responseData.data?.access_token;
    if (!authToken) {
      setShowBoxMessage?.({ type: 'error', message: 'Login token was not returned. Please try again.' });
      return;
    }
    Cookies.set("uat", authToken, { path: "/", expires: new Date(Date.now() + 24 * 60 * 6000) });
    // 2. Set account cookie with user data
    if (typeof window !== "undefined" && responseData.data) {
      Cookies.set("account", JSON.stringify(responseData.data), { 
        path: "/", 
        expires: new Date(Date.now() + 24 * 60 * 6000)
      });
      Cookies.set("uat", authToken, { path: "/", expires: new Date(Date.now() + 24 * 60 * 6000) });
      // 3. Set account in localStorage
      localStorage.setItem("account", JSON.stringify(responseData.data));
    }

    // Handle cart sync if mutate function exists
    try {
      const oldCartValue = JSON.parse(localStorage.getItem("cart"))?.items;
      if (oldCartValue?.length > 0 && mutate && typeof mutate === 'function') {
        mutate(transformLocalStorageData(oldCartValue));
      }
    } catch (cartError) {
      console.error("Cart sync error:", cartError);
    }
    
    // Refresh contexts - IMPORTANT: refetch AccountContext
    try {
      if (refetch && typeof refetch === 'function') {
        refetch();
      }
      if (compareRefetch && typeof compareRefetch === 'function') compareRefetch();
      if (cartRefetch && typeof cartRefetch === 'function') cartRefetch();
    } catch (refetchError) {
      console.error("Context refetch error:", refetchError);
    }
    
    // Close modal if in modal context
    if (setOpenAuthModal && typeof setOpenAuthModal === 'function') {
      setOpenAuthModal(false);
    }
    
    // Handle wishlist and compare
    try {
      const wishListID = Cookies.get("wishListID");
      const CompareId = Cookies.get("compareId");
      
      if (CompareId && compareCartMutate && typeof compareCartMutate === 'function') {
        compareCartMutate({ product_id: CompareId });
      }
      
      if (wishListID && addToWishlist && typeof addToWishlist === 'function') {
        const productObj = { id: wishListID };
        addToWishlist(productObj);
      }
    } catch (wishlistError) {
      console.error("Wishlist/Compare error:", wishlistError);
    }
    
    // Get CallBackUrl exactly like email login
    const requestedCallBackUrl = Cookies.get("CallBackUrl");
    const finalCallBackUrl = requestedCallBackUrl?.startsWith("/") && !requestedCallBackUrl.startsWith("/auth/")
      ? requestedCallBackUrl
      : "/account/dashboard";
    // Cleanup temporary cookies
    Cookies.remove("wishListID");
    Cookies.remove("compareId");
    Cookies.remove("up"); // Remove phone cookie
    Cookies.remove("uc"); // Remove country code cookie
    Cookies.remove("CallBackUrl");
    // localStorage.removeItem("cart"); // Don't remove cart, email login doesn't
    
    // Show success message
    if (setShowBoxMessage && typeof setShowBoxMessage === 'function') {
      setShowBoxMessage({
        type: 'success',
        message: 'Login successful!'
      });
    }
    
    // Update parent component state
    if (setState && typeof setState === 'function') {
      setState("loggedIn");
    }
    
    // REDIRECT EXACTLY LIKE EMAIL LOGIN
    // Note: Email login has router.push commented out, so we'll mimic that behavior
    // If you want to redirect, uncomment the router.push line below
    
    // Redirect after short delay (like email login would)
    setTimeout(() => {
      // Uncomment this if you want to redirect immediately
      // router.push(finalCallBackUrl);
      
      // Or use window.location for immediate redirect
      window.location.replace(finalCallBackUrl);
    }, 1000);
    
  } else {
    const errorMsg = responseData.data?.message || responseData.response?.data?.message || "OTP verification failed";
    console.error("Login failed:", errorMsg);
    
    if (setShowBoxMessage && typeof setShowBoxMessage === 'function') {
      setShowBoxMessage({
        type: 'error',
        message: errorMsg
      });
    }
  }
};

const useOtpVerification = (setState, setShowBoxMessage) => {
  const { setOpenAuthModal } = useContext(ThemeOptionContext);
  const { mutate } = useCreate(SyncCart, false, false, "No");
  const { addToWishlist } = useContext(WishlistContext);
  const { mutate: compareCartMutate } = useCreate(CompareAPI, false, false, "Added to Compare List");
  
  // Get CallBackUrl EXACTLY like email login
  const CallBackUrl = Cookies.get("CallBackUrl") ? Cookies.get("CallBackUrl") : "/account/dashboard";
  console.log("DEBUG OTPVerification: CallBackUrl =", CallBackUrl);
  
  const { refetch } = useContext(AccountContext);
  const { refetch: cartRefetch } = useContext(CartContext);
  const { refetch: compareRefetch } = useContext(CompareContext);
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (data) => {
      // Get phone from cookies
      const phone = Cookies.get("up");
      
      if (!phone) {
        throw new Error("Phone number not found. Please try again.");
      }

      
      try {
        // Use full backend URL
        const url = `${BASE_URL}/api/auth/login`;
        
        console.log("DEBUG: Calling verification API:", url);
        
        const response = await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: phone,
            otp: data.otp,
          }),
        });

        // Read response
        const responseText = await response.text();
        const responseData = JSON.parse(responseText);       
        return {
          status: response.status,
          data: responseData,
          ok: response.ok,
        };
        
      } catch (error) {
        console.error("DEBUG: Verification API Error:", error);
        throw error;
      }
    },
    onSuccess: (responseData, requestData) => {
      LoginWithMobileHandle(
        responseData, 
        router, 
        refetch, 
        compareRefetch, 
        CallBackUrl, 
        mutate, 
        cartRefetch, 
        setShowBoxMessage, 
        addToWishlist, 
        compareCartMutate, 
        setOpenAuthModal, 
        setState
      );
    },
    onError: (error) => {
      console.error("DEBUG: OTP Verification Error:", error);
      if (setShowBoxMessage) {
        setShowBoxMessage({
          type: 'error',
          message: error.message || "OTP verification failed. Please try again."
        });
      }
    }
  });
};

// Helper function
const transformLocalStorageData = (items) => {
  return items?.map((item) => ({
    product_id: item?.product_id,
    variation_id: item?.variation_id || "",
    quantity: item?.quantity,
  }));
};

export default useOtpVerification;
