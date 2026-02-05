import { Chat } from "../model/Chat.js";
import { Message } from "../model/Message.js";

export const handleSendMessage = async (socket, io, data) => {
  try {
    const { chatId, text, fileUrl, fileType } = data;
    const userId = socket.user._id; // Get sender ID from socket session

    // 1. SECURITY & METADATA UPDATE
    // We update the chat's 'lastMessageAt' and increment unread counts for OTHERS
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, participants: userId },
      {
        $set: { lastMessageAt: new Date() },
        $inc: { "unreadCounts.$[elem].count": 1 },
      },
      {
        arrayFilters: [{ "elem.user": { $ne: userId } }],
        new: true,
      },
    );

    if (!chat) return socket.emit("error", "Chat not found");

    // 2. SAVE MESSAGE
    const newMessage = await Message.create({
      chat: chatId,
      sender: userId,
      text,
      file: {
        url: fileUrl || null,
        fileType: fileType || "none",
      },
      expireAt: 7 * 24 * 60 * 60 * 1000,
    });

    // 3. LINK MESSAGE TO CHAT
    chat.lastMessage = newMessage._id;
    await chat.save();

    // 4. PREPARE DATA FOR FRONTEND
    const populatedMessage = await newMessage.populate(
      "sender",
      "FullName avatar",
    );

    // 5. EMIT TO ROOM (For people inside the chat)
    io.to(`chat:${chatId}`).emit("receive-message", populatedMessage);

    // 6. EMIT TO PARTICIPANTS (For updating their Chat List/Badges)
    chat.participants.forEach((pId) => {
      io.to(pId.toString()).emit("update-chat-list", {
        chatId,
        lastMessage: populatedMessage,
        // Send the specific unread count for this participant
        unreadCount:
          chat.unreadCounts.find((u) => u.user.toString() === pId.toString())
            ?.count || 0,
      });
    });
  } catch (error) {
    console.error("Socket SendMessage Error:", error);
    socket.emit("error", "Failed to send message");
  }
};
