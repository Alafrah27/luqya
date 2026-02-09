import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import SocketConnection from "../components/socketConnection";
import { Stack, useNavigationContainerRef } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LngProvider } from "../context/LngContext";
import "../lib/i18";
import "../global.css";
import { useAuthStore } from "@/store/Store";
import { useEffect, useRef } from "react";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from "../lib/queryClient";
import SentryErrorBoundary from "../components/SentryErrorBoundary";
import { KeyboardProvider } from 'react-native-keyboard-controller';
import {
  initSentry,
  addNavigationBreadcrumb,
  captureException,
  Sentry
} from "../lib/sentry";

// Initialize Sentry before anything else
initSentry();

// Global unhandled promise rejection handler
// This catches async errors that aren't caught by try/catch
if (!global.__sentryPromiseHandlerSet) {
  global.__sentryPromiseHandlerSet = true;

  const originalHandler = global.ErrorUtils?.getGlobalHandler?.();

  global.ErrorUtils?.setGlobalHandler?.((error, isFatal) => {
    // Capture to Sentry
    captureException(error, {
      tags: {
        fatal: String(isFatal),
        handler: 'global'
      },
    });

    // Call original handler
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

// This tells Expo to show the alert even if the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Root Layout Component
 * Wrapped with Sentry.wrap() for performance monitoring
 * Protected by SentryErrorBoundary for crash recovery
 */
export default Sentry.wrap(function RootLayout() {
  const { user, isSignIn, token, userAuth } = useAuthStore();
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef();

  useEffect(() => {
    userAuth();
  }, [userAuth]);

  // Track navigation changes for breadcrumbs
  useEffect(() => {
    if (!navigationRef.current) return;

    // Get initial route name
    const initialRoute = navigationRef.current.getCurrentRoute();
    if (initialRoute) {
      routeNameRef.current = initialRoute.name;
    }

    // Listen for navigation state changes
    const unsubscribe = navigationRef.current.addListener('state', () => {
      const currentRoute = navigationRef.current?.getCurrentRoute();
      const currentRouteName = currentRoute?.name;

      // Only add breadcrumb if route actually changed
      if (currentRouteName && currentRouteName !== routeNameRef.current) {
        addNavigationBreadcrumb(currentRouteName, currentRoute.params || {});
        routeNameRef.current = currentRouteName;
      }
    });

    return () => unsubscribe?.();
  }, [navigationRef.current]);

  const checkAuth = user && isSignIn && token;

  return (
    <SentryErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <KeyboardProvider>
            <LngProvider>
              <BottomSheetModalProvider>
                <>
                  <StatusBar style="dark" />
                  {checkAuth && <SocketConnection />}
                  <Stack
                    screenOptions={{ headerShown: false }}
                  >
                    {!checkAuth ? (
                      <Stack.Screen name="(auth)" />
                    ) : (
                      <Stack.Screen name="(tabs)" />
                    )}

                    <Stack.Screen name="chat" />

                    <Stack.Screen name="accountsetting" options={{
                      headerShown: false,
                      presentation: "modal",
                      title: "Setting Account",
                      animation: "fade"
                    }} />

                    <Stack.Screen name="+not-found" />
                  </Stack>
                </>
              </BottomSheetModalProvider>
            </LngProvider>
          </KeyboardProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SentryErrorBoundary>
  );
});
