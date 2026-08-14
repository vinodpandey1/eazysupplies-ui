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
import { BASE_URL, CompareAPI, LoginAPI, SyncCart } from "../axiosUtils/API";
import { YupObject, emailSchema, passwordSchema, recaptchaSchema } from "../validation/ValidationSchema";
import useCreate from "./useCreate";

export const LogInSchema = YupObject({
  email: emailSchema,
  password: passwordSchema,
  recaptcha: recaptchaSchema,
});

const transformLocalStorageData = (localStorageData) => {
  const transformedData = localStorageData?.map((item) => ({
    product_id: item?.product_id,
    variation_id: item?.variation_id || "",
    quantity: item?.quantity,
  }));

  return transformedData;
};

const LoginHandle = async (responseData, router, refetch, CallBackUrl, setShowBoxMessage, setOpenAuthModal) => {
  if (responseData.status === 200 || responseData.status === 201) {
    Cookies.set("uat", responseData.data?.access_token, { path: "/", expires: new Date(Date.now() + 24 * 60 * 60 * 1000) });
    const ISSERVER = typeof window === "undefined";
    if (typeof window !== "undefined") {
      Cookies.set("account", JSON.stringify(responseData.data));
      localStorage.setItem("account", JSON.stringify(responseData.data));
      setShowBoxMessage(responseData.data?.message);
    }
    await refetch();
    Cookies.remove("CallBackUrl", { path: "/" });
    // compareRefetch();
    setOpenAuthModal(false);
    router.replace(CallBackUrl);
    router.refresh();
    // cartRefetch();
    // const wishListID = Cookies.get("wishListID");
    // const CompareId = Cookies.get("compareId");
    // const productObj = { id: wishListID };
    // wishListID ? addToWishlist(productObj) : null;
    Cookies.remove("wishListID");
    Cookies.remove("compareId");
    // localStorage.removeItem("cart");
  } else {
    // console.log(responseData.response.data.error, "iii")
    setShowBoxMessage(responseData?.response?.data?.error);
  }
};

const useHandleLogin = (setShowBoxMessage = () => {}) => {
  const { setOpenAuthModal } = useContext(ThemeOptionContext);
  // const { mutate } = useCreate(SyncCart, false, false, "No");
  // const { addToWishlist } = useContext(WishlistContext);
  // const { mutate: compareCartMutate } = useCreate(CompareAPI, false, false, "Added to Compare List");
  const requestedCallBackUrl = Cookies.get("CallBackUrl");
  const CallBackUrl = requestedCallBackUrl?.startsWith("/") &&
    !requestedCallBackUrl.startsWith("//") &&
    !requestedCallBackUrl.startsWith("/auth/")
    ? requestedCallBackUrl
    : "/account/dashboard";
  const { refetch } = useContext(AccountContext);
  // const { refetch: cartRefetch } = useContext(CartContext);
  // const { refetch: compareRefetch } = useContext(CompareContext);
  const router = useRouter();
  return useMutation({
    mutationFn: async (data) => {
      const response = await request({ url: BASE_URL + LoginAPI, method: "post", data, withCredentials: true });
      if (response?.response) throw response;
      return response;
    },
    onSuccess: async (responseData) => LoginHandle(responseData, router, refetch, CallBackUrl, setShowBoxMessage, setOpenAuthModal),
    onError: (err) => setShowBoxMessage(err?.response?.data?.error || err?.message || "Unable to log in"),
  });
};

export default useHandleLogin;
