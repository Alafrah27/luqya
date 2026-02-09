import { Message } from "../model/Message.js";
import { Chat } from "../model/Chat.js";
import { io, onlineUsers, activeChatRooms } from "../lib/SocketIo.js";
import { Expo } from "expo-server-sdk";

const expo = new Expo();

export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text, fileUrl, fileType, public_id } = req.body;
    const userId = req.user._id;

    // 1. SAVE MESSAGE FIRST
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

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // 3. SOCKET EMIT (To everyone in the room)
    // We send to everyone in the room. The sender (if connected via socket) will get it too.
    // Frontend should handle deduplication or simply append if not present.
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
          console.log(
            "Sending Push Notification to",
            participant.Expopushtoken,
          );
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
      const unreadCount =
        chat.unreadCounts.find((u) => u.user.toString() === pId)?.count || 0;

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("update-chat-list", {
          chatId,
          lastMessage: {
            text: text,
            sender: populatedMessage.sender,
            messageType: fileType || "text",
            createdAt: populatedMessage.createdAt,
          },
          unreadCount,
        });
      }
    });

    return res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    // The frontend sends the ID of the OLDEST message it currently has
    const { before } = req.query;

    let query = { chat: chatId };

    // If 'before' exists, only get messages older than that ID
    if (before) {
      query._id = { $lt: before };
    }

    const messages = await Message.find(query)
      .populate("sender", "FullName avatar")
      .sort({ _id: -1 }) // Get newest first
      .limit(30); // Reasonable chunk size

    return res.status(200).json({
      success: true,
      messages: messages.reverse(),
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
