import { create } from "zustand";
import { createSocket } from "../lib/SocketIo";
import * as Notifications from "expo-notifications";
import { queryClient } from "../lib/queryClient";

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

    socket.on("connect", () => {
      set({ isConnect: true });
    });

    socket.on("disconnect", () => {
      set({ isConnect: false });
    });

    socket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });

    socket.on("user-online", ({ userId }) => {
      set((state) => ({
        onlineUsers: [...new Set([...state.onlineUsers, userId])],
      }));
    });

    socket.on("user-offline", ({ userId }) => {
      set((state) => ({
        onlineUsers: state.onlineUsers.filter((id) => id !== userId),
      }));
    });

    socket.on("friendRequestAccepted", ({ userId }) => {
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

      console.log("Friend request accepted by user:", userId);
    });

    socket.on("newFriendRequest", (data) => {
      // Refresh notifications list to show the new request
      queryClient.invalidateQueries(["notification"]);

      Notifications.scheduleNotificationAsync({
        content: {
          title: "New Friend Request",
          body: `${data.sender.FullName} sent you a friend request`,
        },
        trigger: null,
      });
    });

    set({ socket });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) socket.disconnect();

    set({
      socket: null,
      onlineUsers: [],
      isConnect: false,
    });
  },
}));
