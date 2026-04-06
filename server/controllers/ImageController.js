import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import userModel from "../models/userModel.js";

// Controller function to remove bg from image
const removeBgImage = async (req, res) => {
  try {
    // ✅ Clerk ID from auth middleware
    const clerkId = req.auth.userId;
    console.log("Image Remove Clerk ID:", clerkId);

    const user = await userModel.findOne({ clerkId });

    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }

    if (user.creditBalance <= 0) {
      return res.json({
        success: false,
        message: "No Credit Balance",
        creditBalance: user.creditBalance,
      });
    }

    if (!req.file) {
      return res.json({ success: false, message: "No Image Uploaded" });
    }

    const imagePath = req.file.path;
    console.log("Uploaded Image Path:", imagePath);

    // Read image file
    const imageFile = fs.createReadStream(imagePath);

    const formData = new FormData();
    formData.append("image_file", imageFile);

    // Clipdrop API call
    const response = await axios.post(
      "https://clipdrop-api.co/remove-background/v1",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "x-api-key": process.env.CLIPDROP_API,
        },
        responseType: "arraybuffer",
      }
    );

    const base64Image = Buffer.from(response.data, "binary").toString("base64");
    const resultImage = `data:${req.file.mimetype};base64,${base64Image}`;

    // Deduct 1 credit
    const updatedUser = await userModel.findByIdAndUpdate(
      user._id,
      { creditBalance: user.creditBalance - 1 },
      { new: true }
    );

    // delete uploaded temp file
    fs.unlinkSync(imagePath);

    return res.json({
      success: true,
      resultImage,
      creditBalance: updatedUser.creditBalance,
      message: "Background Removed Successfully",
    });

  } catch (error) {
    console.log("Remove BG Error:", error.response?.data || error.message);
    return res.json({
      success: false,
      message: error.response?.data?.message || error.message,
    });
  }
};

export { removeBgImage };