import http from "http";
import { Server } from "socket.io";
import express from "express";
import { socketMiddleware } from "../middleWare/SocketMiddleWare.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Required for Expo Go to connect
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

export const onlineUsers = new Map();

io.use(socketMiddleware);

io.on("connection", (socket) => {
  const userId = socket.userId;
  onlineUsers.set(userId, socket.id);

  // Join a room specifically for this user's ID
  socket.join(userId);

  // Notify everyone of the new online list
  io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
  });
});

export { io, app, server };
