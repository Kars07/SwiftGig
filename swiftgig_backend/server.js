import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";              
import { Server as SocketIOServer } from "socket.io"; 
import { connectDB } from "./configs/database.js";
import UserRoute from "./routes/UserRoute.js";
import chatRoutes from "./routes/chatRoutes.js";
import talentRoute from "./routes/talentRoute.js";
import clientRoute from "./routes/clientRoute.js";
import profileRoutes from "./routes/profileRoutes.js";

//Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app); //instead of app.listen()

//Initialize Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173", // React frontend
    methods: ["GET", "POST"],
    credentials: true
  },
});

const activeUsers = new Map(); // ✅ Track active users for notifications

// ✅ Socket.io Events
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // When a user joins
  socket.on("user:join", ({ userId, userName, role }) => {
    activeUsers.set(userId, { socketId: socket.id, userName, role });
    socket.userId = userId;
    console.log(`${userName} (${role}) joined`);
  });

  // Join chat room
  socket.on("chat:join", ({ gigId }) => {
    socket.join(`gig-${gigId}`);
  });

  // Send message
  socket.on("message:send", (data) => {
    const { gigId, senderId, senderName, senderRole, receiverId, message, messageType } = data;

    const messageData = {
      gigId,
      senderId,
      senderName,
      senderRole,
      receiverId,
      message,
      messageType: messageType || "text",
      timestamp: new Date(),
      read: false,
      _id: generateMessageId(),
    };

    // Send message to all users in the room
    io.to(`gig-${gigId}`).emit("message:receive", messageData);

    // Notify receiver
    const receiver = activeUsers.get(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("notification:new", {
        type: "message",
        gigId,
        senderName,
        message: message.substring(0, 50),
      });
    }
  });

  // Mark messages as read
  socket.on("message:read", ({ gigId, userId }) => {
    io.to(`gig-${gigId}`).emit("messages:marked-read", { gigId, userId });
  });

  // Typing indicators
  socket.on("typing:start", ({ gigId, userId, userName }) => {
    socket.to(`gig-${gigId}`).emit("typing:show", { userId, userName });
  });

  socket.on("typing:stop", ({ gigId, userId }) => {
    socket.to(`gig-${gigId}`).emit("typing:hide", { userId });
  });

  // Disconnect
  socket.on("disconnect", () => {
    if (socket.userId) {
      activeUsers.delete(socket.userId);
    }
  });
});

// Helper function
function generateMessageId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Standard Middleware
app.use("/api/chat", chatRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// API Routes
app.use("/api", UserRoute);
app.use("/api/talent", talentRoute);
app.use("/api/client", clientRoute);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
  res.send("SwiftGig Backend Running...");
});

//Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});