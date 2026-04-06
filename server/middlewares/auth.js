import jwt from "jsonwebtoken";

// middleware function to decode clerk token
const authUser = async (req, res, next) => {
  try {
    const token = req.headers.token;

    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorised Login Again",
      });
    }

    const token_decode = jwt.decode(token);

    console.log("Decoded Token:", token_decode);

    if (!token_decode || !token_decode.sub) {
      return res.json({
        success: false,
        message: "Invalid Token",
      });
    }

    req.auth = {
      userId: token_decode.sub,
    };

    next();
  } catch (error) {
    console.log("Auth Error:", error.message);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export default authUser;