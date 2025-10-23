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

// Get or create chat room
export const getOrCreateRoom = async (req, res) => {
  try {
    const { gigId, gigName, clientId, clientName, talentId, talentName } = req.body;

    // Check if room already exists
    let room = await ChatRoom.findOne({
      gigId,
      clientId,
      talentId
    });

    // If room doesn't exist, create it
    if (!room) {
      room = await ChatRoom.create({
        gigId,
        gigName,
        clientId,
        clientName,
        talentId,
        talentName,
        lastMessage: "",
        lastMessageTime: new Date(),
        unreadCount: {
          client: 0,
          talent: 0
        }
      });
    }

    res.json({ success: true, roomId: room._id });
  } catch (error) {
    console.error("Error in getOrCreateRoom:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};