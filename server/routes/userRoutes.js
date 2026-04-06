import express from "express";
import { clerkWebhooks, usercredits, createUser } from "../controllers/userController.js";
import authUser from "../middlewares/auth.js";

const userRoutes = express.Router();

userRoutes.post("/webhooks", clerkWebhooks);
userRoutes.post("/create", createUser);
userRoutes.get("/credits", authUser, usercredits);

export default userRoutes;