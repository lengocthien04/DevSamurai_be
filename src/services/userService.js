const UserModel = require("../models/userModel");

class UserService {
  async login(email, password) {
    try {
      const result = await UserModel.loginUser(email, password);
      return result;
    } catch (error) {
      console.error("Error in UserService.login:", error.message);
      return { status: 500, message: "Internal server error during login" };
    }
  }

  async register(email, password, username) {
    try {
      if (!email || !password || !username) {
        return {
          status: 400,
          message: "Email, password, and username are required",
        };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { status: 400, message: "Invalid email format" };
      }

      if (password.length < 6) {
        return {
          status: 400,
          message: "Password must be at least 6 characters long",
        };
      }

      const result = await UserModel.registerUser(email, password, username);
      return result;
    } catch (error) {
      console.error("Error in UserService.register:", error.message);
      return {
        status: 500,
        message: "Internal server error during registration",
      };
    }
  }
}

module.exports = new UserService();
