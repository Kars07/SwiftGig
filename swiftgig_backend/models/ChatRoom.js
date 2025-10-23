import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
  gigId: { type: String, required: true },
  gigName: { type: String, required: true },
  clientId: { type: String, required: true },
  clientName: { type: String, required: true },
  talentId: { type: String, required: true },
  talentName: { type: String, required: true },
  lastMessage: { type: String },
  lastMessageTime: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  unreadCount: {
    client: { type: Number, default: 0 },
    talent: { type: Number, default: 0 },
  },
}, { timestamps: true });

export default mongoose.model("ChatRoom", chatRoomSchema);
