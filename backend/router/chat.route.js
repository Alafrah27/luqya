import express from "express";
import {
  getMyChats,
  getorcreatedChat,
} from "../controller/chat.controllser.js";
import { verifyJWT } from "../middleWare/jwtAuth.js";

const router = express.Router();

router.get("/", verifyJWT, getMyChats);
router.get("/:userId", verifyJWT, getorcreatedChat);

export default router;
