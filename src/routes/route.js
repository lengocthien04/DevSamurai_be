const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../utils/authenticate");

const {
  loginUser,
  registerUser,
  getMyInfo,
} = require("../controllers/userController");

router.get("/", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/me", authenticateToken, getMyInfo);

module.exports = { router };
