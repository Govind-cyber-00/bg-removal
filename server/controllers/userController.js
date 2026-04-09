import { Webhook } from "svix";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import transactionModel from "../models/transactionModel.js";

// ==========================
// Clerk webhook
// ==========================
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
          email: data.email_addresses?.[0]?.email_address || "",
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          photo: data.image_url || "",
        };

        const existingUser = await userModel.findOne({ clerkId: data.id });

        if (!existingUser) {
          await userModel.create(userData);
        }

        return res.json({ success: true, message: "User created" });
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses?.[0]?.email_address || "",
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          photo: data.image_url || "",
        };

        await userModel.findOneAndUpdate({ clerkId: data.id }, userData);
        return res.json({ success: true, message: "User updated" });
      }

      case "user.deleted": {
        await userModel.findOneAndDelete({ clerkId: data.id });
        return res.json({ success: true, message: "User deleted" });
      }

      default:
        return res.json({
          success: false,
          message: "Unhandled webhook event",
        });
    }
  } catch (error) {
    console.log("Webhook Error:", error.message);
    return res.json({ success: false, message: error.message });
  }
};

// ==========================
// Manual user create
// ==========================
const createUser = async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, photo } = req.body;

    if (!clerkId || !email) {
      return res.json({
        success: false,
        message: "clerkId and email are required",
      });
    }

    let user = await userModel.findOne({ clerkId });

    if (!user) {
      user = await userModel.create({
        clerkId,
        email,
        firstName: firstName || "",
        lastName: lastName || "",
        photo: photo || "",
      });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.log("Create User Error:", error.message);
    return res.json({ success: false, message: error.message });
  }
};

// ==========================
// Get user credits
// ==========================
const usercredits = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    const userData = await userModel.findOne({ clerkId });

    if (!userData) {
      return res.json({ success: false, message: "User Not Found" });
    }

    return res.json({
      success: true,
      creditBalance: userData.creditBalance,
    });
  } catch (error) {
    console.log("Credits Error:", error.message);
    return res.json({ success: false, message: error.message });
  }
};

// ==========================
// Razorpay initialize
// ==========================
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ==========================
// Create Razorpay Order
// ==========================
const paymentRazorpay = async (req, res) => {
  try {
    const clerkId = req.auth.userId; // ✅ FIXED
    const { planId } = req.body;     // ✅ FIXED

    const userData = await userModel.findOne({ clerkId });

    if (!userData || !planId) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    let credits = 0;
    let plan = "";
    let amount = 0;

    switch (planId) {
      case "Basic":
        plan = "Basic";
        credits = 100;
        amount = 10;
        break;

      case "Advanced":
        plan = "Advanced";
        credits = 500;
        amount = 250;
        break;

      case "Business":
        plan = "Business";
        credits = 5000;
        amount = 1000;
        break;

      default:
        return res.json({ success: false, message: "Invalid Plan" });
    }

    const date = Date.now();

    // create transaction
    const transactionData = {
      clerkId,
      plan,
      amount,
      credits,
      date,
      payment: false,
    };

    const newTransaction = await transactionModel.create(transactionData);

    const options = {
      amount: amount * 100,
      currency: process.env.CURRENCY || "INR",
      receipt: newTransaction._id.toString(),
      notes: {
        clerkId,
        planId,
        credits,
        transactionId: newTransaction._id.toString(),
      },
    };

    const order = await razorpayInstance.orders.create(options);

    return res.json({ success: true, order });
  } catch (error) {
    console.log("Payment Razorpay Error:", error.message);
    return res.json({ success: false, message: error.message });
  }
};


// Verify Razorpay Payment
// ==========================
const verifyRazorpay = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    const transactionId = orderInfo.notes.transactionId;
    const credits = Number(orderInfo.notes.credits);

    // update transaction
    await transactionModel.findByIdAndUpdate(transactionId, {
      payment: true,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    // add credits
    const userData = await userModel.findOne({ clerkId });

    await userModel.findOneAndUpdate(
      { clerkId },
      { creditBalance: userData.creditBalance + credits }
    );

    return res.json({
      success: true,
      message: "Credits Added Successfully",
    });
  } catch (error) {
    console.log("Verify Razorpay Error:", error.message);
    return res.json({ success: false, message: error.message });
  }
};

export {
  clerkWebhooks,
  usercredits,
  createUser,
  paymentRazorpay,
  verifyRazorpay,
};

export default clerkWebhooks;