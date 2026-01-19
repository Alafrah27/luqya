import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import instance from "../lib/axios";

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  token: null,

  // Helper function to handle auth success logic
  setAuthSession: async (user, token) => {
    await AsyncStorage.setItem("token", token);
    set({ user, token });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Welcome! 👋 to luqya",
        body: `Logged in as ${user.FullName}`,
        sound: "default",
      },
      trigger: null,
    });
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await instance.post("/auth/register", data);
      const { user, token } = res.data;
      await useAuthStore.getState().setAuthSession(user, token);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      return { success: false, message };
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await instance.post("/auth/login", data);
      const { user, token } = res.data;
      await useAuthStore.getState().setAuthSession(user, token);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      return { success: false, message };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));