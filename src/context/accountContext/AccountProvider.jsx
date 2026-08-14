import request from "@/utils/axiosUtils";
import { SelfAPI } from "@/utils/axiosUtils/API";
import useFetchQuery from "@/utils/hooks/useFetchQuery";;
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import AccountContext from ".";

const AccountProvider = (props) => {
  const cookies = Cookies.get("uat");
  const [mobileSideBar, setMobileSideBar] = useState(false);
  const [accountData, setAccountData] = useState();
  const { data, refetch, fetchStatus, error, isError } = useFetchQuery([SelfAPI], async () => {
    const response = await request({ url: SelfAPI, withCredentials: true, method: "GET" });
    if (response?.response || response?.isAxiosError) throw response;
    return response;
  }, {
    enabled: false,
    select: (res) => {
      return res?.data;
    },
  });

  useEffect(() => {
    cookies && refetch() ;
  }, [cookies]);

  useEffect(() => {
    if (data) {
      setAccountData(data);
    }
  }, [fetchStatus == "fetching", data]);

  useEffect(() => {
    const status = error?.response?.status;
    if (!isError || (status !== 400 && status !== 401)) return;

    Cookies.remove("uat", { path: "/" });
    Cookies.remove("account", { path: "/" });
    setAccountData(undefined);

    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/")) {
      window.location.replace("/auth/login");
    }
  }, [error, isError]);

  return <AccountContext.Provider value={{ ...props, accountData, setAccountData, refetch, mobileSideBar, setMobileSideBar }}>{props.children}</AccountContext.Provider>;
};

export default AccountProvider;
