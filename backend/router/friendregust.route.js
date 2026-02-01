import express from "express";
import {
  acceptFriendRequest,
  getAllMyFriendRequests,
  sendFriendRequest,
  unfollowFriend,
} from "../controller/friendreguest.controller.js";
import { verifyJWT } from "../middleWare/jwtAuth.js";
const router = express.Router();

router.get("/request", verifyJWT, getAllMyFriendRequests);
router.post("/send-request/:id", verifyJWT, sendFriendRequest);
router.post("/accept-request/:id", verifyJWT, acceptFriendRequest);
router.delete("/delete-request/:id", verifyJWT, unfollowFriend);
export default router;
