import jwt from "jsonwebtoken";
import User from "../model/user.model.js";
import cloudinary from "../lib/cloudinary.js";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const loginWithPhone = async (req, res) => {
  try {
    // 1. Get data from Firebase Middleware and Request Body
    const { phoneNumber, firebaseUid } = req.firebaseUser;
    const { expopushtoken, FullName } = req.body; // Added FullName from body

    if (!phoneNumber || !firebaseUid) {
      return res.status(400).json({ message: "Invalid firebase user data" });
    }

    // 2. Look for existing user
    let user = await User.findOne({ phoneNumber });

    // 3. Setup a random avatar if it's a new user
    const seed = Math.random().toString(36).substring(7);
    const randomAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

    if (!user) {
      // NEW USER REGISTRATION
      user = new User({
        phoneNumber,
        firebaseUid,
        FullName: FullName || "New User", // Fallback if name is missing
        avatar: randomAvatar,
        Expopushtoken: expopushtoken || "",
        lastLogin: new Date(),
      });

      // Use validateBeforeSave: true to ensure your schema rules are followed
      await user.save();
      console.log(`✨ New user registered: ${phoneNumber}`);
    } else {
      // EXISTING USER LOGIN - Update tokens and UID if changed
      let isChanged = false;

      if (user.firebaseUid !== firebaseUid) {
        user.firebaseUid = firebaseUid;
        isChanged = true;
      }

      if (expopushtoken && user.Expopushtoken !== expopushtoken) {
        user.Expopushtoken = expopushtoken;
        isChanged = true;
      }

      user.lastLogin = new Date();

      if (isChanged) await user.save();
      console.log(`👋 User logged in: ${user.FullName}`);
    }

    // 4. Generate your Backend JWT
    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        phoneNumber: user.phoneNumber,
        FullName: user.FullName,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Get the user ID from the authenticated user
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { FullName, avatar, email } = req.body;
    const userId = req.user._id;

    const updates = {};

    // 1. Handle FullName update
    if (FullName) {
      updates.FullName = FullName;
    }

    if (email) {
      updates.email = email;
    }

    // 2. Handle Avatar update via Cloudinary
    if (avatar) {
      // 'avatar' should be a Base64 string from your Expo app
      try {
        const uploadResponse = await cloudinary.uploader.upload(avatar, {
          folder: "avatars",
        });
        updates.avatar = uploadResponse.secure_url;
      } catch (cloudinaryErr) {
        console.error("Cloudinary Upload Error:", cloudinaryErr);
        return res.status(500).json({ message: "Failed to upload image" });
      }
    }

    // 3. Check if there is actually anything to update
    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    // 4. Update the user in Database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ Profile updated for: ${updatedUser.FullName}`);
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Find the user first to get their avatar info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Delete Avatar from Cloudinary if it exists
    if (user.avatar && user.avatar.includes("cloudinary")) {
      try {
        // Extract public_id from the URL (e.g., 'avatars/filename')
        const publicId = user.avatar.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`avatars/${publicId}`);
      } catch (cloudinaryErr) {
        console.error("Cloudinary Delete Error:", cloudinaryErr);
        // We don't stop the process if image deletion fails, just log it
      }
    }

    // 3. Remove this user from everyone else's friends and block lists
    await User.updateMany(
      { $or: [{ friends: userId }, { block: userId }] },
      { $pull: { friends: userId, block: userId } }
    );

    // 4. Delete the User document
    await User.findByIdAndDelete(userId);
    console.log(`🗑️ Account deleted: ${user.FullName} (${userId})`);

    return res.status(200).json({
      message: "Account and associated data deleted successfully",
    });
  } catch (error) {
    console.error("Delete Account Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
