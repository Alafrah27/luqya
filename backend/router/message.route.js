import express from "express";
import { getMessages } from "../controller/message.controller.js";
import { verifyJWT } from "../middleWare/jwtAuth.js";
import { handleSendMessage } from "../controller/message.socket.js";

const router = express.Router();
router.post("/send", verifyJWT, handleSendMessage);
router.get("/:chatId", verifyJWT, getMessages);

export default router;
