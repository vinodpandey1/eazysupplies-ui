import request from "@/utils/axiosUtils";
import { SettingAPI } from "@/utils/axiosUtils/API";
import useFetchQuery from "@/utils/hooks/useFetchQuery";
import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";
import SettingContext from ".";

const SettingProvider = (props) => {
  const [menuLoader, setMenuLoader] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState({});
  const [settingState, setSettingData] = useState({});
  const [settingObj, setSettingObj] = useState({});
  const { data: settingData, isLoading, refetch } = useFetchQuery([SettingAPI], () => request({ url: SettingAPI }), { enabled: false, refetchOnWindowFocus: false, select: (res) => res?.data?.values});

  useEffect(() => {
    refetch(); // 🔁 Fetch settings when component mounts
  }, []);

  useEffect(() => {
    if (settingData) {
      if (settingData?.maintenance?.maintenance_mode) {
        Cookies.set("maintenance", JSON.stringify(true));
      } else {
        Cookies.remove("maintenance");
      }
      setSettingData(settingData);
      setSettingObj(settingData);
    }
  }, [settingData]);

  useEffect(() => {
    isLoading && refetch();
  }, [isLoading]);
  const convertCurrency = useCallback(
    (value) => {
      let position = selectedCurrency?.symbol_position ? selectedCurrency?.symbol_position : settingObj?.general?.default_currency?.symbol_position || "before_price";
      let symbol = selectedCurrency?.symbol ? selectedCurrency?.symbol : settingObj?.general?.default_currency?.symbol || "$";
      const numericValue = Number(value);
      const configuredRate = Number(
        selectedCurrency?.exchange_rate ?? settingObj?.general?.default_currency?.exchange_rate ?? 1
      );
      const amount = (Number.isFinite(numericValue) ? numericValue : 0) *
        (Number.isFinite(configuredRate) && configuredRate > 0 ? configuredRate : 1);
      if (position == "before_price") {
        return `${symbol}${amount.toFixed(2)}`;
      } else return `${amount.toFixed(2)} ${symbol}`;
    },
    [settingObj, selectedCurrency]
  );
  return <SettingContext.Provider value={{ ...props, settingData, convertCurrency, selectedCurrency, setSelectedCurrency, menuLoader, isLoading, setMenuLoader }}>{props.children}</SettingContext.Provider>;
};
export default SettingProvider;
