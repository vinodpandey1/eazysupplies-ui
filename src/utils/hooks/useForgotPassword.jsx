{/*import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import request from "../axiosUtils";
import { ForgotPasswordAPI } from "../axiosUtils/API";
import { YupObject, emailSchema } from "../validation/ValidationSchema";

export const ForgotPasswordSchema = YupObject({ email: emailSchema });

const useHandleForgotPassword = (setShowBoxMessage, setState) => {
  const router = useRouter();
  return useMutation({
    mutationFn: (data) => request({ url: ForgotPasswordAPI, method: "post", data }, router),
    onSuccess: (responseData, requestData) => {
      if (responseData.status === 200 || responseData.status === 201) {
        Cookies.set("ue", requestData.email);
        setState("otp");
      } else {
        setShowBoxMessage(responseData?.response.data.message);
      }
    },
  });
};
export default useHandleForgotPassword;*/}
/*Added By Simran Samir*/
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import request from "../axiosUtils";
import { YupObject, emailSchema } from "../validation/ValidationSchema";
import { BASE_URL } from "../axiosUtils/API";

export const ForgotPasswordSchema = YupObject({ email: emailSchema });

const useHandleForgotPassword = (setShowBoxMessage, setState) => {
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`${BASE_URL}/api/auth/password-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "request", email: data.email, audience: "customer" }),
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
        email: data.email
      };
    },
    onSuccess: (responseData, requestData) => {
      if (responseData.status === 200 || responseData.status === 201 || responseData.ok) {
        const email = responseData.email || requestData.email;
        
        Cookies.set("email", email, {
          path: "/",
          expires: new Date(Date.now() + 10 * 60 * 1000)
        });
        
        if (setShowBoxMessage) {
          setShowBoxMessage({
            type: 'success',
            message: responseData.data?.message || 'Verification code sent to your email!'
          });
        }
        
        setTimeout(() => {
          if (setState && typeof setState === 'function') {
            setState("emailOtp");
          }
        }, 1000);
        
      } else {
        // Better error message handling
        let errorMsg = responseData.data?.message || responseData.data?.error || "Failed to send OTP";
        
        // Make error messages user-friendly
        if (errorMsg.toLowerCase().includes('user not found') || 
            errorMsg.toLowerCase().includes('does not exist')) {
          errorMsg = "Account not found. Please check your email or create a new account.";
        }
        else if (errorMsg.toLowerCase().includes('internal server error')) {
          errorMsg = "Something went wrong. Please try again in a few moments.";
        }
        else if (errorMsg.toLowerCase().includes('too many requests')) {
          errorMsg = "Too many attempts. Please try again after 15 minutes.";
        }
        
        console.error("Forgot password failed:", errorMsg);
        
        if (setShowBoxMessage) {
          setShowBoxMessage({
            type: 'error',
            message: errorMsg
          });
        }
      }
    },
    onError: (error) => {
      console.error("Forgot Password API Error:", error);
      
      let errorMsg = error.message || "Failed to send OTP. Please try again.";
      
      if (errorMsg.includes('fetch') || errorMsg.includes('network') || errorMsg.includes('connection')) {
        errorMsg = "Network error. Please check your internet connection.";
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

export default useHandleForgotPassword;
