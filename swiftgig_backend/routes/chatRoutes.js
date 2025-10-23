import express from "express";
import { getChatRooms, getMessages, getOrCreateRoom } from "../controllers/chatController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get chat rooms for a user
router.get("/rooms/:userId", getChatRooms);

// Get messages in a chat room
router.get("/messages/:gigId", getMessages);

// Get or create chat room
router.post("/get-or-create-room", getOrCreateRoom);

export default router;