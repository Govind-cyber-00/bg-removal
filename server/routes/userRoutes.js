import express from "express";
import {
  clerkWebhooks,
  usercredits,
  createUser,
  paymentRazorpay,
  verifyRazorpay,
} from "../controllers/userController.js";
import authUser from "../middlewares/auth.js";

const userRoutes = express.Router();

userRoutes.post("/webhooks", clerkWebhooks);
userRoutes.post("/create", createUser);
userRoutes.get("/credits", authUser, usercredits);
userRoutes.post("/pay-razor", authUser, paymentRazorpay);
userRoutes.post("/verify-razor", authUser, verifyRazorpay);

export default userRoutes;