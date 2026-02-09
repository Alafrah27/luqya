import { Chat } from "../model/Chat.js";
import { Message } from "../model/Message.js";
import { Expo } from "expo-server-sdk";

const expo = new Expo();

export const handleSendMessage = async (
  socket,
  io,
  data,
  onlineUsers,
  activeChatRooms,
) => {
  try {
    const { chatId, text, fileUrl, fileType, public_id } = data;
    const userId = socket.userId;

    // 1. SAVE MESSAGE FIRST to get the ID and data
    const newMessage = await Message.create({
      chat: chatId,
      sender: userId,
      text,
      file: {
        url: fileUrl || null,
        public_id: public_id || null, // Ensure we save this for deletion!
        fileType: fileType || "none",
      },
      expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const populatedMessage = await newMessage.populate(
      "sender",
      "FullName avatar",
    );

    // 2. UPDATE CHAT METADATA
    // We must match the schema: lastMessage is an OBJECT, not an ID.
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, participants: userId },
      {
        $set: {
          lastMessageAt: new Date(),
          lastMessage: {
            text: text,
            sender: userId,
            messageType: fileType && fileType !== "none" ? fileType : "text",
          },
        },
        $inc: { "unreadCounts.$[elem].count": 1 },
      },
      {
        arrayFilters: [{ "elem.user": { $ne: userId } }],
        new: true,
      },
    ).populate("participants", "FullName avatar Expopushtoken");

    if (!chat) return socket.emit("error", "Chat not found");

    // 3. SOCKET EMIT (To everyone in the room, including sender for confirmation)
    io.to(`chat:${chatId}`).emit("receive-message", populatedMessage);

    // 4. SMART NOTIFICATION LOGIC (Socket + Expo)
    chat.participants.forEach(async (participant) => {
      const pId = participant._id.toString();
      if (pId === userId.toString()) return;

      const recipientSocketId = onlineUsers.get(pId);
      // Check if user is currently looking at THIS chat
      const currentViewingChat = recipientSocketId
        ? activeChatRooms.get(recipientSocketId)
        : null;

      // --- LOGIC: If user is NOT in this specific chat room ---
      if (currentViewingChat !== chatId) {
        // A. If Online: Send In-App Socket Notification (Toast/Popup)
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("push-notification", {
            title: populatedMessage.sender.FullName,
            body: text || "Sent a file",
            chatId: chatId,
            avatar: populatedMessage.sender.avatar,
          });
        }

        // B. Expo Push Notification (Background/Killed state)
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

      // 5. Update Chat List Badge (Always update badge even if in chat, or maybe not? usually yes)
      // The unread count is already incremented in DB. We send the new count.
      const unreadCount =
        chat.unreadCounts.find((u) => u.user.toString() === pId)?.count || 0;

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("update-chat-list", {
          chatId,
          lastMessage: {
            text: text,
            sender: populatedMessage.sender, // We might want full sender info here for preview
            messageType: fileType || "text",
            createdAt: populatedMessage.createdAt,
          },
          unreadCount,
        });
      }
    });
  } catch (error) {
    console.error("Socket SendMessage Error:", error);
    socket.emit("error", "Failed to send message");
  }
};
