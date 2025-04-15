const { pool } = require("../database/PostgreDatabase");

class UserModel {
  // Check if email exists in database
  async checkIfEmailExists(email) {
    try {
      const query = "SELECT * FROM users WHERE email = $1";
      const result = await pool.query(query, [email]);
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking if email exists:", error.message);
      throw error;
    }
  }

  // Check if username exists in database
  async checkIfUsernameExists(username) {
    try {
      const query = "SELECT * FROM users WHERE username = $1";
      const result = await pool.query(query, [username]);
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error checking if username exists:", error.message);
      throw error;
    }
  }

  // Verify password
  async isCorrectPassword(email, password) {
    try {
      const query = "SELECT password FROM users WHERE email = $1";
      const result = await pool.query(query, [email]);
      if (result.rows.length === 0) {
        return false;
      }
      return result.rows[0].password === password;
    } catch (error) {
      console.error("Error checking password:", error.message);
      throw error;
    }
  }

  async loginUser(email, password) {
    try {
      const isExistEmail = await this.checkIfEmailExists(email);
      if (!isExistEmail) {
        return { status: 409, message: "Email not found" };
      } else {
        const isCorrect = await this.isCorrectPassword(email, password);
        if (isCorrect) {
          // Get user details for response
          const userQuery =
            "SELECT username, email FROM users WHERE email = $1";
          const userResult = await pool.query(userQuery, [email]);

          return {
            status: 200,
            message: "Login successful",
            email: email,
            username: userResult.rows[0].username,
          };
        } else {
          return { status: 401, message: "Incorrect password" };
        }
      }
    } catch (error) {
      console.log("Error loginUser:", error.message);
      throw error;
    }
  }

  async addUser(email, password, username) {
    try {
      const query =
        "INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING *";
      const result = await pool.query(query, [email, password, username]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async registerUser(email, password, username) {
    try {
      // Check if email already exists
      const isExistEmail = await this.checkIfEmailExists(email);
      if (isExistEmail) {
        return { status: 409, message: "Email already exists" };
      }

      // Check if username already exists
      const isExistUsername = await this.checkIfUsernameExists(username);
      if (isExistUsername) {
        return { status: 409, message: "Username already exists" };
      }

      // Add user to database
      await this.addUser(email, password, username);
      return { status: 200, message: "User registered successfully" };
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const query = "SELECT username, email FROM users WHERE email = $1";
      const result = await pool.query(query, [email]);

      if (result.rows.length === 0) {
        return { status: 404, message: "User not found" };
      }

      return {
        status: 200,
        message: "User found successfully",
        user: result.rows[0],
      };
    } catch (error) {
      console.error("Error getting user by email:", error.message);
      throw error;
    }
  }
}

module.exports = new UserModel();
