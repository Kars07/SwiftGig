import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";

// Get chat rooms for a user
export const getChatRooms = async (req, res) => {
  try {
    const { userId } = req.params;
    const rooms = await ChatRoom.find({
      $or: [{ clientId: userId }, { talentId: userId }]
    }).sort({ lastMessageTime: -1 });

    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages in a gig chat
export const getMessages = async (req, res) => {
  try {
    const { gigId } = req.params;
    const messages = await Message.find({ gigId }).sort({ timestamp: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create chat room
export const createChatRoom = async (req, res) => {
  try {
    const { gigId, gigName, clientId, clientName, talentId, talentName } = req.body;

    const roomExists = await ChatRoom.findOne({ gigId });
    if (roomExists) return res.json({ success: true, message: "Chat room already exists", roomExists });

    const newRoom = await ChatRoom.create({
      gigId,
      gigName,
      clientId,
      clientName,
      talentId,
      talentName,
      lastMessage: "Chat started",
      lastMessageTime: new Date(),
      unreadCount: { client: 0, talent: 0 },
    });

    res.json({ success: true, message: "Chat room created", chatRoom: newRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};