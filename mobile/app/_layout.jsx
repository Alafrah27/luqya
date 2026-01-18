import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { LngProvider } from "../context/LngContext";
import "../lib/i18";
import "../global.css";

import * as Notifications from "expo-notifications";
import { useEffect } from "react";
// Ensure i18n is initialized
export default function RootLayout() {
  const router = useRouter()
  const islogin = true
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
  useEffect(() => {
    setTimeout(() => {

      if (!islogin) {
        router.replace("wellcome");
      } else {
        router.replace("chat");
      }
    }, 2000)

    return () => clearTimeout();
  }, [router, islogin]);

  return (
    <>
      <StatusBar style="auto" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>

          <LngProvider>
            <Stack>
              <Stack.Screen name="(auth)" options={{
                 headerShown: false,
                 Animation: 'fade',
                  }} />
              <Stack.Screen name="(tabs)" options={{
                 headerShown: false,
                 Animation :"fade",
                  }} />
            </Stack>
          </LngProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </>
  );
}
