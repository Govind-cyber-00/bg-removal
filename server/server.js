// import "dotenv/config";
// import express from "express";
// import cors from "cors";
// import connectDB from "./configs/mongodb.js";
// import userRoutes from "./routes/userRoutes.js";
// import imageRouter from "./routes/imageRoutes.js";

// const app = express();
// const PORT = process.env.PORT || 4000;

// // connect DB
// connectDB();

// // middleware
// app.use(express.json());

// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "https://bg-removal-gys.vercel.app"
//     ],
//     credentials: true,
//   })
// );

// // routes
// app.get("/", (req, res) => {
//   res.send("API Working 🚀");
// });

// app.use("/api/user", userRoutes);
// app.use("/api/image", imageRouter);

// app.get("/api/test", async (req, res) => {
//   try {
//     res.json({ success: true, message: "API working and DB connected" });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // local server start
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });





import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./configs/mongodb.js";
import userRoutes from "./routes/userRoutes.js";
import imageRouter from "./routes/imageRoutes.js";

const app = express();

// connect DB
connectDB();

// middleware
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://bg-removal-gys.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// root route
app.get("/", (req, res) => {
  res.send("API Working 🚀");
});

// test route
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API working and DB connected" });
});

// routes
app.use("/api/user", userRoutes);
app.use("/api/image", imageRouter);


export default app;