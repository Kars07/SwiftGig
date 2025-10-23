import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";

// Get chat rooms for a user
export const getChatRooms = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Basic validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const rooms = await ChatRoom.find({
      $or: [{ clientId: userId }, { talentId: userId }]
    }).sort({ lastMessageTime: -1 });

    return res.json({
      success: true,
      rooms
    });
  } catch (error) {
    console.error("Error in getChatRooms:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get messages in a gig chat
export const getMessages = async (req, res) => {
  try {
    const { gigId } = req.params;

    // Basic validation
    if (!gigId) {
      return res.status(400).json({
        success: false,
        message: "Gig ID is required"
      });
    }

    const messages = await Message.find({ gigId })
      .sort({ timestamp: 1 });

    return res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error("Error in getMessages:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get or create a chat room
export const getOrCreateRoom = async (req, res) => {
  try {
    const { gigId, gigName, clientId, clientName, talentId, talentName } = req.body;
    
    // Add basic validation without JWT
    if (!gigId || !clientId || !talentId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: gigId, clientId, and talentId are required"
      });
    }

    // Look for existing room
    let room = await ChatRoom.findOne({
      gigId,
      clientId,
      talentId
    });

    // Create new room if doesn't exist
    if (!room) {
      room = await ChatRoom.create({
        gigId,
        gigName: gigName || 'Untitled Gig',
        clientId,
        clientName: clientName || clientId.slice(0, 6) + '...' + clientId.slice(-4),
        talentId,
        talentName: talentName || talentId.slice(0, 6) + '...' + talentId.slice(-4),
        lastMessage: '',
        lastMessageTime: new Date(),
        unreadCount: { client: 0, talent: 0 }
      });
    }

    return res.json({
      success: true,
      roomId: room._id,
      room
    });
  } catch (error) {
    console.error("Error in getOrCreateRoom:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating chat room"
    });
  }
};