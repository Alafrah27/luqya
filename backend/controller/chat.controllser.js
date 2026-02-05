import { Chat } from "../model/Chat.js";

export const getMyChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({ participants: userId })
      .populate("participants", "FullName avatar")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    const chatformatted = chats.map((chat) => {
      const otherUser = chat.participants.find(
        (p) => p._id.toString() !== userId.toString(),
      );
      return {
        _id: chat._id,
        participants: otherUser,
        lastMessage: chat.lastMessage,
        lastMessageAt: chat.lastMessageAt,
        unreadCount:
          chat.unreadCounts.find((u) => u.user.toString() === userId.toString())
            ?.count || 0,
      };
    });

    return res.status(200).json({ chats: chatformatted });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getorcreatedChat = async (req, res) => {
  try {
    const { userId } = req.params; // Target User
    const currentUserId = req.user._id;

    // 1. Prevent self-chat
    if (userId === currentUserId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot create a chat with yourself" });
    }

    // 2. Search for existing chat
    let chat = await Chat.findOne({
      participants: { $all: [userId, currentUserId] },
    })
      .populate("participants", "FullName avatar")
      .populate("lastMessage");

    if (chat) {
      // 3. IMPROVEMENT: Reset unread count for the current user
      // because they are now opening the chat.
      await Chat.updateOne(
        { _id: chat._id, "unreadCounts.user": currentUserId },
        { $set: { "unreadCounts.$.count": 0 } },
      );

      // Update the local object so the response shows 0
      const myCount = chat.unreadCounts.find(
        (u) => u.user.toString() === currentUserId.toString(),
      );
      if (myCount) myCount.count = 0;

      return res.status(200).json({ chat });
    }

    // 4. Create new chat if it doesn't exist
    chat = await Chat.create({
      participants: [userId, currentUserId],
      unreadCounts: [
        { user: userId, count: 0 },
        { user: currentUserId, count: 0 },
      ],
    });

    // Populate for a consistent frontend response
    await chat.populate("participants", "FullName avatar");

    return res.status(200).json({ chat });
  } catch (error) {
    console.error("Error in getorcreatedChat:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
