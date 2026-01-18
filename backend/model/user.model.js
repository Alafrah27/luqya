import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    FullName: {
      type: String,
      required: true,
    },
    firebaseUid: {
      type: String,
      required: true,
    },
    Expopushtoken: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "FriendRequest" }],
    block: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastLogin: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
