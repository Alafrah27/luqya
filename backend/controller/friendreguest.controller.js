import Friendship from "../model/friendregust.model.js";
import User from "../model/user.model.js";
import { io } from "../lib/SocketIo.js";

export const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { id: receiverId } = req.params;

    const friendship = await Friendship.create({
      sender: senderId,
      receiver: receiverId,
    });

    const populated = await friendship.populate(
      "sender",
      "FullName avatar email",
    );

    // 🔥 REAL TIME EVENT
    io.to(receiverId.toString()).emit("newFriendRequest", populated);

    return res.status(200).json({
      success: true,
      message: "Friend request sent",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const {id: requestId } = req.params;
    const userId = req.user._id;

    const request = await Friendship.findById(requestId);

    request.status = "accepted";
    await request.save();

    await User.findByIdAndUpdate(userId, {
      $push: { friends: request.sender },
    });

    await User.findByIdAndUpdate(request.sender, {
      $push: { friends: userId },
    });

    // 🔥 notify sender
    io.to(request.sender.toString()).emit("friendRequestAccepted", {
      userId,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "error" });
  }
};

export const unfollowFriend = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: friendId } = req.params;

    // Remove from both users
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    });

    // Delete friendship record
    await Friendship.findOneAndDelete({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId },
      ],
    });

    res.json({ message: "Friend removed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllMyFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Find requests where I am the receiver AND status is pending
    const friendRequests = await Friendship.find({
      receiver: userId,
      status: "pending",
    })
      .populate("sender", "FullName avatar email") // Get sender details
      .sort({ createdAt: -1 }); // Show newest requests first

    // 2. Return the count and the data
    return res.status(200).json({
      success: true,
      count: friendRequests.length,
      requests: friendRequests,
    });
  } catch (error) {
    console.error("Fetch Requests Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
