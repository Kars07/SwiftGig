import express from "express";
import { getChatRooms, getMessages, createChatRoom } from "../controllers/chatController.js";

const router = express.Router();

router.get("/rooms/:userId", getChatRooms);
router.get("/messages/:gigId", getMessages);
router.post("/create-room", createChatRoom);

export default router;
