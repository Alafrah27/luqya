import { Message } from "../model/Message.js";
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
