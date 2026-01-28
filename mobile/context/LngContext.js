import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { I18nManager, NativeModules } from "react-native";
import { registerForPushNotificationsAsync } from "../utils/registerForPushNotificationsAsync";

const lngcontext = createContext();

const LngProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [error, setError] = useState(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token))
      .catch((err) => setError(err));
  }, []);

  const changeLanguage = async (lng) => {
    setLoading(true);
    setTimeout(async () => {
      try {
        await i18n.changeLanguage(lng);
        await AsyncStorage.setItem("lng", lng);
        I18nManager.allowRTL(lng === "ar");
        I18nManager.forceRTL(lng === "ar");
        NativeModules.DevSettings.reload();
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }, 5000);
  };
  return (
    <lngcontext.Provider
      value={{
        changeLanguage,
        loading,
        expoPushToken,
        error,
      }}
    >
      {children}
    </lngcontext.Provider>
  );
};

const useContextProvider = () => {
  const context = useContext(lngcontext);
  if (context === undefined) {
    throw new Error("useContext must be inside a Provider with a value");
  }
  return context;
};

export { LngProvider, useContextProvider };
