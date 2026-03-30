import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./configs/mongodb.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;

// middleware
app.use(express.json());
app.use(cors());

// connect DB
connectDB();

// routes
app.get("/", (req, res) => {
  res.send("API Working 🚀");
});

app.use("/api/user", userRoutes);

app.get("/api/test", async (req, res) => {
  try {
    res.json({ success: true, message: "API working and DB connected" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});