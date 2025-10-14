import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./configs/database.js";
import UserRoute from "./routes/UserRoute.js";
import talentRoute from "./routes/talentRoute.js";
import clientRoute from "./routes/clientRoute.js";
import profileRoutes from "./routes/profileRoutes.js";

// Connect to MongoDB
connectDB();

const app = express();


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// Routes
app.use("/api", UserRoute);
app.use("/api/talent", talentRoute);
app.use("/api/client", clientRoute);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
  res.send("SwiftGig Backend Running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
