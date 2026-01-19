import { create } from "zustand";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import instance from "../lib/axios";

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: false,
  token: null,

  RegisterFn: async (data) => {
    set({ isLoading: true });
    try {
      const res = await instance.post("/auth/register", data);
      const { user, token } = res.data;

      // Persist backend token
      await AsyncStorage.setItem("token", token);
      set({ user, token });

      // 5. Success Notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Welcome! 👋 to luqya",
          body: `Logged in as ${user.FullName}`,
          sound: "default",
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Google Login Error:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  LoginFn: async (data) => {
    set({ isLoading: true });
    try {
      const res = await instance.post("/auth/login", data);
      const { user, token } = res.data;

      // Persist backend token
      await AsyncStorage.setItem("token", token);
      set({ user, token });

      // 5. Success Notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Welcome! 👋 to luqya",
          body: `Logged in as ${user.FullName}`,
          sound: "default",
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Google Login Error:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));
