import express from "express";
import { clerkWebhooks, usercredits } from "../controllers/userController.js";
import authUSer from "../middlewares/auth.js";

const userRoutes = express.Router();

userRoutes.post("/webhooks", clerkWebhooks);
userRoutes.get('/credits',authUSer,usercredits)

export default userRoutes;