// import admin from "firebase-admin";
// import dotenv from "dotenv";

// dotenv.config();
// admin.initializeApp({
//   credential: admin.credential.cert({
//     projectId: process.env.FIREBASE_PROJECT_ID,
//     clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//     // Try this more robust replacement
//     privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").replace(
//       /"/g,
//       ""
//     ),
//   }),
// });
// export default admin;




// export const loginWithGoogle = async (req, res) => {
//   try {
//     // 1. Get data from your Firebase Middleware (which verified the Google ID Token)
//     // Your middleware should now provide 'email', 'name', and 'picture'
//     const { email, firebaseUid, name, picture } = req.firebaseUser;
//     const { expopushtoken } = req.body;

//     if (!firebaseUid || !email) {
//       return res.status(400).json({ message: "Invalid Google authentication data" });
//     }

//     // 2. Find user by firebaseUid (Best practice: link by UID, not just email)
//     let user = await User.findOne({ firebaseUid });

//     if (!user) {
//       // NEW USER REGISTRATION
//       // If the user doesn't exist, we create a new one using Google profile data
//       user = new User({
//         firebaseUid,
//         email: email.toLowerCase(),
//         FullName: name || "Google User",
//         avatar: picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUid}`,
//         Expopushtoken: expopushtoken || "",
//         lastLogin: new Date(),
//       });

//       await user.save();
//       console.log(`✨ New Google user registered: ${email}`);
//     } else {
//       // EXISTING USER LOGIN
//       // Update their info in case it changed on their Google Account
//       user.lastLogin = new Date();
//       if (expopushtoken) user.Expopushtoken = expopushtoken;
//       if (name) user.FullName = name;
//       if (picture) user.avatar = picture;

//       await user.save();
//       console.log(`👋 Google user logged in: ${user.FullName}`);
//     }

//     // 3. Generate your Backend JWT for your Express API sessions
//     const token = generateToken(user._id);

//     return res.status(200).json({
//       message: "Login successful",
//       token,
//       user: {
//         _id: user._id,
//         email: user.email,
//         FullName: user.FullName,
//         avatar: user.avatar,
//       },
//     });
//   } catch (error) {
//     console.error("Google Login Error:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
