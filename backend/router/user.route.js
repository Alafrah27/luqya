import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  Register,
  Login,
} from "../controller/user.controller.js";

import { verifyJWT } from "../middleWare/jwtAuth.js";
const router = express.Router();

router.post("/register", Register);
router.post("/login", Login);
router.get("/user-profile", verifyJWT, getUserProfile);
router.put("/update-profile", verifyJWT, updateUserProfile);
router.delete("/delete-account", verifyJWT, deleteUserAccount);
export default router;
