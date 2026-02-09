import express from "express";
import { getMessages, sendMessage } from "../controller/message.controller.js";
import { verifyJWT } from "../middleWare/jwtAuth.js";

const router = express.Router();

router.get("/:chatId", verifyJWT, getMessages);
router.post("/:chatId", verifyJWT, sendMessage);

export default router;
