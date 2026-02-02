import { io } from "socket.io-client";

export const socketIo = io("https://luqya.onrender.com", {
  transports: ["websocket"],
});
