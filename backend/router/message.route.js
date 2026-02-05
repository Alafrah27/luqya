import express from "express";
import { getMessages } from "../controller/message.controller.js";
import { verifyJWT } from "../middleWare/jwtAuth.js";


const router = express.Router();
router.get("/:chatId", verifyJWT, getMessages);

export default router;
