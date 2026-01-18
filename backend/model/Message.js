import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    documentType: {
      type: String,
      enum: ["image", "pdf", "none"],
      default: "none",
    },
    audioUrl: {
      type: String,
      default: null,
    },
    expireAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// delete message after expireAt time
MessageSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
// indexes for faster queries
MessageSchema.index({ chat: 1, createdAt: 1 }); // oldest one first
// 1 - asc
// -1 -> desc

export const Message = mongoose.model("Message", MessageSchema);
