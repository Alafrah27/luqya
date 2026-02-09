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
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

export const onlineUsers = new Map();
// --- ADD THIS LINE ---
// Tracks which chatId each socket.id is currently looking at
export const activeChatRooms = new Map();

io.use(socketMiddleware);

io.on("connection", (socket) => {
  const userId = socket.userId;
  onlineUsers.set(userId, socket.id);

  socket.broadcast.emit("user-online", { userId });
  socket.join(userId);

  io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

  // --- UPDATE THIS BLOCK ---
  socket.on("join-chat", (chatId) => {
    socket.join(`chat:${chatId}`);
    activeChatRooms.set(socket.id, chatId); // Mark as active in this chat
    console.log(`User ${userId} joined chat: ${chatId}`);
  });

  socket.on("leave-chat", (chatId) => {
    socket.leave(`chat:${chatId}`);
    activeChatRooms.delete(socket.id); // No longer active in this chat
  });

  socket.on("send-message", async (data) => {
    // We pass activeChatRooms to our controller to check recipient status
    handleSendMessage(socket, io, data, onlineUsers, activeChatRooms);
  });

  socket.on("typing", async (data) => {
    const { chatId, isTyping } = data;
    const typingPayload = { userId, chatId, isTyping };

    socket.to(`chat:${chatId}`).emit("typing", typingPayload);

    try {
      const chat = await Chat.findById(chatId).select("participants");
      if (chat) {
        const otherParticipantId = chat.participants.find(
          (p) => p.toString() !== userId.toString(),
        );

        if (otherParticipantId) {
          socket
            .to(otherParticipantId.toString())
            .emit("typing-list", typingPayload);
        }
      }
    } catch (error) {}
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    activeChatRooms.delete(socket.id); // --- ADD THIS ---
    socket.broadcast.emit("user-offline", { userId });
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
  });
});

export { io, app, server };
