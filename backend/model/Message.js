import mongoose from "mongoose";
import { deleteFromCloudinary } from "../lib/cloudinary.js";

const MessageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, required: true, trim: true },
    // Changed to an object to store both the URL and the Cloudinary ID
    file: {
      url: { type: String, default: null },
      public_id: { type: String, default: null }, // CRITICAL for deletion
      fileType: {
        type: String,
        enum: ["image", "pdf", "audio", "none"],
        default: "none",
      },
    },
    expireAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// TTL Index: Mongoose deletes the DOCUMENT from MongoDB
MessageSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// MIDDLEWARE: Before the document is deleted, delete the file from Cloudinary
MessageSchema.pre("findOneAndDelete", async function (next) {
  const docToDel = await this.model.findOne(this.getQuery());
  if (docToDel?.file?.public_id) {
    // We use a helper function to call Cloudinary API
    await deleteFromCloudinary(docToDel.file.public_id, docToDel.file.fileType);
  }
  next();
});

export const Message = mongoose.model("Message", MessageSchema);
