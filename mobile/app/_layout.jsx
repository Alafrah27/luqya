import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import SocketConnection from "../components/socketConnection";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LngProvider } from "../context/LngContext";
import "../lib/i18";
import "../global.css";
import { useAuthStore } from "@/store/Store";
import { useEffect } from "react";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from "../lib/queryClient";

// This tells Expo to show the alert even if the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const { user, isSignIn, token, userAuth } = useAuthStore();

  useEffect(() => {
    userAuth();
  }, [userAuth]);

  const checkAuth = user && isSignIn && token;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <LngProvider>
          <BottomSheetModalProvider>
            <>
              <StatusBar style="dark" />
              {checkAuth && <SocketConnection />}
              <Stack screenOptions={{ headerShown: false }}>
                {!checkAuth ? (
                  <Stack.Screen name="(auth)" />
                ) : (
                  <Stack.Screen name="(tabs)" />
                )}

                <Stack.Screen name="accountsetting" options={{
                  headerShown: false,
                  presentation: "modal",
                  title: "Setting Account",
                  animation: "fade"
                }} />
              </Stack>
            </>
          </BottomSheetModalProvider>
        </LngProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}