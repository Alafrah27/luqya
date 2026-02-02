import { create } from "zustand";
import { socketIo } from "../lib/SocketIo";
export const SocketIoStore = create((set, get) => ({
  onlineUsers: new Set(),
  isConnect: Boolean,
  socket: null,

  connect: () => {
    const existingSocket = get().socket;
    if (existingSocket?.connected) return;

    if (existingSocket) existingSocket.disconnect();

    const socket = socketIo();
    socket.on("connect", () => {
      set({ isConnect: true });
    });

    socket.on("disconnect", () => {
      set({ isConnect: false });
    });

    socket.on("getOnlineUsers", (onlineUsers) => {
      set({ onlineUsers: new Set(onlineUsers) });
    });
  },

  set({s})
}));
