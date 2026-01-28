import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LngProvider } from "../context/LngContext";
import "../lib/i18";
import "../global.css";
import { useAuthStore } from "@/store/Store";
import { useEffect, } from "react";


export default function RootLayout() {

  const { user, isSignIn, token, userAuth } = useAuthStore();



  useEffect(() => {
    userAuth();
  }, [userAuth]);


  const checkAuth = user && isSignIn && token;

  const ProtectRoute = () => {
    return (
      <>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={!checkAuth}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
          <Stack.Protected guard={!!checkAuth}>
            <Stack.Screen name="(tabs)" />
          </Stack.Protected>

          <Stack.Screen name="accountsetting" options={{
            headerShown: false,
            presentation: "modal",
            title: "Setting Account",
            animation: "fade"

          }} />
        </Stack>
      </>
    )
  }

  // This tells Expo to show the alert even if the app is open
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LngProvider>
          <BottomSheetModalProvider>

            <ProtectRoute />

          </BottomSheetModalProvider>
        </LngProvider>
      </GestureHandlerRootView>
    </>
  );
}