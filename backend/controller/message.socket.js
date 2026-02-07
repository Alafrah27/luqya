import { Chat } from "../model/Chat.js";
import { Message } from "../model/Message.js";
import { Expo } from "expo-server-sdk";
import { onlineUsers, activeChatRooms } from "../lib/SocketIo.js";


const expo = new Expo();

export const handleSendMessage = async (socket, io, data) => {
  try {
    const { chatId, text, fileUrl, fileType } = data;
    const userId = socket.userId;

    // 1. UPDATE DB (Chat Metadata)
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, participants: userId },
      {
        $set: { lastMessageAt: new Date() },
        $inc: { "unreadCounts.$[elem].count": 1 },
      },
      { arrayFilters: [{ "elem.user": { $ne: userId } }], new: true },
    ).populate("participants", "FullName avatar Expopushtoken"); // Populate the token!

    if (!chat) return socket.emit("error", "Chat not found");

    // 2. SAVE MESSAGE
    const newMessage = await Message.create({
      chat: chatId,
      sender: userId,
      text,
      file: { url: fileUrl || null, fileType: fileType || "none" },
      expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    chat.lastMessage = newMessage._id;
    await chat.save();

    const populatedMessage = await newMessage.populate(
      "sender",
      "FullName avatar",
    );

    // 3. SOCKET EMIT (For people inside the chat room)
    io.to(`chat:${chatId}`).emit("receive-message", populatedMessage);

    // 4. SMART NOTIFICATION LOGIC (Socket + Expo)
    chat.participants.forEach(async (participant) => {
      const pId = participant._id.toString();
      if (pId === userId.toString()) return;

      const recipientSocketId = onlineUsers.get(pId);
      const currentViewingChat = recipientSocketId
        ? activeChatRooms.get(recipientSocketId)
        : null;

      // --- LOGIC: If user is NOT in this specific chat room ---
      if (currentViewingChat !== chatId) {
        // A. If Online: Send In-App Socket Notification (Toast)
        if (recipientSocketId) {
          io.to(pId).emit("push-notification", {
            title: populatedMessage.sender.FullName,
            body: text || "Sent a file",
            chatId: chatId,
            avatar: populatedMessage.sender.avatar,
          });
        }

        // B. Always try Expo Push (The phone handles showing/hiding if app is open)
        if (Expo.isExpoPushToken(participant.Expopushtoken)) {
          try {
            await expo.sendPushNotificationsAsync([
              {
                to: participant.Expopushtoken,
                sound: "default",
                title: populatedMessage.sender.FullName,
                body: text || "Sent a file",
                data: { chatId, type: "message" },
              },
            ]);
          } catch (pushError) {
            console.error("Expo Push Error:", pushError);
          }
        }
      }

      // 5. Update Chat List Badge
      io.to(pId).emit("update-chat-list", {
        chatId,
        lastMessage: populatedMessage,
        unreadCount:
          chat.unreadCounts.find((u) => u.user.toString() === pId)?.count || 0,
      });
    });
  } catch (error) {
    console.error("Socket SendMessage Error:", error);
    socket.emit("error", "Failed to send message");
  }
};
