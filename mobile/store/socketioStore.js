import { create } from "zustand";
import { createSocket } from "../lib/SocketIo";
import * as Notifications from "expo-notifications";
import { queryClient } from "../lib/queryClient";
import { captureSocketError, addBreadcrumb } from "../lib/sentry";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const SocketIoStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],
  isConnect: false,

  connect: (token) => {
    if (!token) return;

    const existing = get().socket;
    if (existing?.connected) return;

    if (existing) existing.disconnect();

    const socket = createSocket(token);

    // Connection established
    socket.on("connect", () => {
      set({ isConnect: true });
      addBreadcrumb("socket", "Socket connected", { socketId: socket.id });
    });

    // Disconnection
    socket.on("disconnect", (reason) => {
      set({ isConnect: false });
      addBreadcrumb("socket", "Socket disconnected", { reason });
    });

    // Connection error - capture to Sentry
    socket.on("connect_error", (error) => {
      captureSocketError(error, {
        event: "connect_error",
        connected: false,
        data: { message: error?.message || "Unknown error" },
      });
      addBreadcrumb("socket", "Connection error", { error: error?.message });
    });

    // Generic error event - capture to Sentry
    socket.on("error", (error) => {
      captureSocketError(error, {
        event: "error",
        connected: socket?.connected,
        data: { message: error?.message || "Unknown socket error" },
      });
    });

    socket.on("getOnlineUsers", (users) => {
      // Defensive check: ensure users is an array
      set({ onlineUsers: Array.isArray(users) ? users : [] });
    });

    socket.on("user-online", (data) => {
      // Defensive check: ensure data and userId exist
      const userId = data?.userId;
      if (!userId) return;

      set((state) => {
        const currentUsers = Array.isArray(state.onlineUsers)
          ? state.onlineUsers
          : [];
        return {
          onlineUsers: [...new Set([...currentUsers, userId])],
        };
      });
    });

    socket.on("user-offline", (data) => {
      // Defensive check: ensure data and userId exist
      const userId = data?.userId;
      if (!userId) return;

      set((state) => {
        const currentUsers = Array.isArray(state.onlineUsers)
          ? state.onlineUsers
          : [];
        return {
          onlineUsers: currentUsers.filter((id) => id !== userId),
        };
      });
    });

    socket.on("friendRequestAccepted", async (data) => {
      // Defensive check
      const userId = data?.userId;

      // Clear caches so fresh data is fetched
      await AsyncStorage.multiRemove(["notification_cache", "users_cache"]);

      // Refresh friends list/users
      queryClient.invalidateQueries(["users"]);
      // Refresh notifications just in case
      queryClient.invalidateQueries(["notification"]);

      Notifications.scheduleNotificationAsync({
        content: {
          title: "Friend Request Accepted",
          body: "Your friend request was accepted!",
        },
        trigger: null,
      });

      addBreadcrumb("socket", "Friend request accepted", {
        userId: userId || "unknown",
      });
    });

    socket.on("newFriendRequest", async (data) => {
      // Defensive check: ensure data and sender exist
      if (!data) return;

      // Clear notification cache so fresh data is fetched
      await AsyncStorage.removeItem("notification_cache");

      // Refresh notifications list to show the new request
      queryClient.invalidateQueries(["notification"]);

      const senderName = data?.sender?.FullName || "Someone";
      const senderId = data?.sender?._id || "unknown";

      Notifications.scheduleNotificationAsync({
        content: {
          title: "New Friend Request",
          body: `${senderName} sent you a friend request`,
        },
        trigger: null,
      });

      addBreadcrumb("socket", "New friend request received", {
        senderId: senderId,
      });
    });

    set({ socket });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      addBreadcrumb("socket", "Socket disconnect initiated");
      socket.disconnect();
    }

    set({
      socket: null,
      onlineUsers: [],
      isConnect: false,
    });
  },
}));
