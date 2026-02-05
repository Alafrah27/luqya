import http from "http";
import { Server } from "socket.io";
import express from "express";
import { socketMiddleware } from "../middleWare/SocketMiddleWare.js";

import { handleSendMessage } from "../controller/message.socket.js";
import { Chat } from "../model/Chat.js";

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
  // notify others that this current user is online
  socket.broadcast.emit("user-online", { userId });
  // Join a room specifically for this user's ID
  socket.join(userId);

  // Notify everyone of the new online list
  io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

  socket.on("join-chat", (chatId) => {
    socket.join(`chat:${chatId}`);
  });

  socket.on("leave-chat", (chatId) => {
    socket.leave(`chat:${chatId}`);
  });

  // handelsend message
  socket.on("send-message", async (data) => {
    handleSendMessage(socket, io, data);
  });

  socket.on("typing", async (data) => {
    const { chatId, isTyping } = data;

    const typingPayload = {
      userId, // From your socket authentication
      chatId,
      isTyping,
    };

    // 1. Emit to the chat room (for the user currently in the chat screen)
    socket.to(`chat:${chatId}`).emit("typing", typingPayload);

    // 2. Personal Room Emit (for the Chat List badge)
    // BUG FIX: Ensure the personal room name matches how you handle other events (e.g., "update-chat-list")
    // If you are talking to another participant, we need their ID.

    try {
      // ONLY fetch from DB if necessary.
      // Optimization: If your frontend sends the receiverId in the data, you can skip the DB call!
      const chat = await Chat.findById(chatId).select("participants");

      if (chat) {
        const otherParticipantId = chat.participants.find(
          (p) => p.toString() !== userId.toString(),
        );

        if (otherParticipantId) {
          // Emit to the specific user's private room
          // Make sure this matches your personal room naming (e.g., just the ID)
          socket
            .to(otherParticipantId.toString())
            .emit("typing-list", typingPayload);
        }
      }
    } catch (error) {
      // Silent fail is good here as typing is non-critical
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);

    socket.broadcast.emit("user-offline", { userId });

    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
  });
});

export { io, app, server };
