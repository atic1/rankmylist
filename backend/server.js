import dotenv from "dotenv";
import dns from "dns";

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// Set DNS servers to resolve SRV records properly on Windows
dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();




const app = express();

// Middleware — CORS must come before routes
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Postman, curl) or allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());


// MongoDB Connection
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
})
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));
console.log("JWT_SECRET:", process.env.JWT_SECRET);


// Test Route
// Test route


// Auth Routes
import authRoutes from "./src/routes/auth.js";  // ← Added .js extension

app.use("/api/auth", authRoutes);

// Movie Routes
import movieRoutes from "./src/routes/movieRoutes.js";  // ← Fixed typo + .js extension

app.use("/api/movies", movieRoutes);

// Tier List Routes
import tierListRoutes from "./src/routes/tierListRoutes.js";
app.use("/api/tierlist", tierListRoutes);

// My List Routes
import myListRoutes from "./src/routes/myListRoutes.js";
app.use("/api/mylist", myListRoutes);

// Review Routes
import reviewRoutes from "./src/routes/reviewRoutes.js";
app.use("/api/reviews", reviewRoutes);

// Admin Routes
import adminRoutes from "./src/routes/adminRoutes.js";
app.use("/api/admin", adminRoutes);

// Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
