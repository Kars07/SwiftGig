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

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Enhanced CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: true
};

// Standard Middleware
app.use(express.json({ limit: '10mb' })); // Add size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors(corsOptions));
app.use(morgan("dev"));

// Basic security middleware
app.use((req, res, next) => {
  // Remove potential security headers
  res.removeHeader('X-Powered-By');
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Initialize Socket.io with enhanced security
const io = new SocketIOServer(server, {
  cors: corsOptions,
  pingTimeout: 60000, // Close connection after 60 seconds of inactivity
  connectTimeout: 10000, // Connection timeout after 10 seconds
});

// Active users management with enhanced structure
const activeUsers = new Map();

// Socket connection handling with basic validation
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // When a user joins - with validation
  socket.on("user:join", ({ userId, userName, role }) => {
    if (!userId || !userName || !role) {
      socket.emit("error", { message: "Invalid user data" });
      return;
    }

    activeUsers.set(userId, {
      socketId: socket.id,
      userName: userName.slice(0, 50), // Limit username length
      role,
      lastActive: new Date()
    });
    socket.userId = userId;
    console.log(`${userName} (${role}) joined`);
  });

  // Join chat room - with validation
  socket.on("chat:join", ({ gigId }) => {
    if (!gigId) {
      socket.emit("error", { message: "Invalid gig ID" });
      return;
    }
    socket.join(`gig-${gigId}`);
  });

  // Send message - with enhanced validation
  socket.on("message:send", (data) => {
    const { gigId, senderId, senderName, senderRole, receiverId, message, messageType } = data;

    // Validate required fields
    if (!gigId || !senderId || !receiverId || !message) {
      socket.emit("error", { message: "Missing required message data" });
      return;
    }

    // Validate message length
    if (message.length > 2000) { // Limit message length
      socket.emit("error", { message: "Message too long" });
      return;
    }

    const messageData = {
      _id: generateMessageId(),
      gigId,
      senderId,
      senderName: senderName?.slice(0, 50) || 'Anonymous', // Sanitize and provide default
      senderRole: senderRole || 'user',
      receiverId,
      message: message.trim(),
      messageType: messageType || "text",
      timestamp: new Date(),
      read: false
    };

    // Send message to room
    io.to(`gig-${gigId}`).emit("message:receive", messageData);

    // Notify receiver if online
    const receiver = activeUsers.get(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("notification:new", {
        type: "message",
        gigId,
        senderName: messageData.senderName,
        message: messageData.message.substring(0, 50) // Preview only
      });
    }
  });

  // Mark messages as read - with validation
  socket.on("message:read", ({ gigId, userId }) => {
    if (!gigId || !userId) {
      socket.emit("error", { message: "Invalid read receipt data" });
      return;
    }
    io.to(`gig-${gigId}`).emit("messages:marked-read", { gigId, userId });
  });

  // Typing indicators - with rate limiting
  let lastTypingEvent = 0;
  socket.on("typing:start", ({ gigId, userId, userName }) => {
    const now = Date.now();
    if (now - lastTypingEvent < 1000) return; // Rate limit to 1 event per second
    lastTypingEvent = now;

    if (!gigId || !userId) {
      socket.emit("error", { message: "Invalid typing data" });
      return;
    }
    socket.to(`gig-${gigId}`).emit("typing:show", { 
      userId, 
      userName: userName?.slice(0, 50) || 'Anonymous'
    });
  });

  socket.on("typing:stop", ({ gigId, userId }) => {
    if (!gigId || !userId) return;
    socket.to(`gig-${gigId}`).emit("typing:hide", { userId });
  });

  // Disconnect handling
  socket.on("disconnect", () => {
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      console.log(`User disconnected: ${socket.userId}`);
    }
  });
});

// Enhanced message ID generation
function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// API Routes - No JWT middleware
app.use("/api/chat", chatRoutes);
app.use("/api", UserRoute);
app.use("/api/talent", talentRoute);
app.use("/api/client", clientRoute);
app.use("/api/profile", profileRoutes);

// Basic health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "online",
    time: new Date().toISOString(),
    message: "SwiftGig Backend Running"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Socket.IO server is ready for connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});