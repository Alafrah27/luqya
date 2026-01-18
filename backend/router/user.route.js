import express from "express";
import {
  loginWithPhone,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
} from "../controller/user.controller.js";
import { verifyFirebaseToken } from "../middleWare/firebaseAuth.js";
import { verifyJWT } from "../middleWare/jwtAuth.js";
const router = express.Router();

router.post("/register", verifyFirebaseToken, loginWithPhone);
router.get("/userProfile", verifyJWT, getUserProfile);
router.put("/updateProfile", verifyJWT, updateUserProfile);
router.delete("/deleteAccount", verifyJWT, deleteUserAccount);
export default router;
