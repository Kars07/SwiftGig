import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  gigId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ["client", "talent"], required: true },
  receiverId: { type: String, required: true },
  message: { type: String, required: true },
  messageType: { type: String, enum: ["text", "file", "image"], default: "text" },
  timestamp: { type: Date, default: Date.now, index: true },
  read: { type: Boolean, default: false },
});

export default mongoose.model("Message", messageSchema);
