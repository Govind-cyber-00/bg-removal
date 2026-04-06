import { Webhook } from "svix";
import userModel from "../models/userModel.js";

// Clerk webhook
const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };

        await userModel.create(userData);
        return res.json({ success: true, message: "User created" });
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };

        await userModel.findOneAndUpdate({ clerkId: data.id }, userData);
        return res.json({ success: true, message: "User updated" });
      }

      case "user.deleted": {
        await userModel.findOneAndDelete({ clerkId: data.id });
        return res.json({ success: true, message: "User deleted" });
      }

      default:
        return res.json({ success: false, message: "Unhandled webhook event" });
    }
  } catch (error) {
    console.log(error.message);
    return res.json({ success: false, message: error.message });
  }
};

// Manual user create (frontend support)
const createUser = async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, photo } = req.body;

    let user = await userModel.findOne({ clerkId });

    if (!user) {
      user = await userModel.create({
        clerkId,
        email,
        firstName,
        lastName,
        photo,
      });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.log("Create User Error:", error.message);
    return res.json({ success: false, message: error.message });
  }
};

// Get credits
const usercredits = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    console.log("Credits Clerk ID:", clerkId);

    const userData = await userModel.findOne({ clerkId });

    if (!userData) {
      return res.json({ success: false, message: "User Not Found" });
    }

    res.json({
      success: true,
      creditBalance: userData.creditBalance,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export { clerkWebhooks, usercredits, createUser };
export default clerkWebhooks;