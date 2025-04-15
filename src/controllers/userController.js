const UserService = require("../services/userService");
const { encrypt } = require("../utils/encrypt");
const { getUserByEmail } = require("../models/userModel");
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("loginUser: ", req.body);
    if (!email || !password) {
      console.log("No email or password provided");
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const encryptedPassword = encrypt(password);
    const result = await UserService.login(email, encryptedPassword);

    if (result.status === 200) {
      // Include email in token payload instead of username
      const token = jwt.sign({ email: email }, JWT_SECRET_KEY, {
        expiresIn: "24h",
      });
      console.log("Login successful, token:", token);
      return res
        .status(result.status)
        .json({ message: result.message, token: token });
    } else {
      console.log("Login failed:", result.message);
      return res.status(result.status).json({ message: result.message });
    }
  } catch (error) {
    console.log("Error loginUser:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ message: "Email, password, and username are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password strength
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const encryptedPassword = encrypt(password);
    const result = await UserService.register(
      email,
      encryptedPassword,
      username
    );
    res.status(result.status).json({ message: result.message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyInfo = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication required. No token provided." });
    }

    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    const email = decoded.email;

    // Assuming UserModel is imported at the top of the file
    const data = await getUserByEmail(email);

    if (data.status !== 200) {
      return res.status(data.status).json({ message: data.message });
    }

    return res.status(200).json({
      data: data.user,
      message: "User information retrieved successfully",
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token." });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired." });
    }

    console.error("Error getting user information:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { loginUser, registerUser, getMyInfo };
