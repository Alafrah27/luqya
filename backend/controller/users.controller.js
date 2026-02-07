import { User } from "../model/user.js";
export const GetAllusers = async (req, res) => {
  const userId = req.user._id;
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  try {
    const users = await User.find({
      _id: { $ne: userId },
    })
      .select("-password")
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    if (!users) {
      return res.status(404).json({ message: "No users found" });
    }
    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleBlockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // 1. Prevent blocking yourself
    if (currentUser._id.toString() === id) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    const isBlocked = currentUser.block.includes(id);

    if (isBlocked) {
      // 2. Unblock logic
      currentUser.block.pull(id);
      await currentUser.save(); // Save BEFORE returning
      return res.status(200).json({
        message: "User unblocked successfully",
        isBlocked: false,
      });
    } else {
      // 3. Block logic
      currentUser.block.push(id);
      await currentUser.save(); // Save BEFORE returning
      return res.status(200).json({
        message: "User blocked successfully",
        isBlocked: true,
      });
    }
  } catch (error) {
    console.error("Block User Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
