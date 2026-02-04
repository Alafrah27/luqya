import { io } from "socket.io-client";

export const createSocket = (token) => {
  return io("https://luqya.onrender.com", {
    transports: ["websocket"],
    auth: {
      token,
    },
  });
};
