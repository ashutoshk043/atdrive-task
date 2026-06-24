const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/mySqlConnect");

// REGISTER
const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({
        success: false,
        message: "Username and password required",
      });
    }

    const [existingUser] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (existingUser.length > 0) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      "INSERT INTO users(username,password) VALUES (?,?)",
      [username, hashedPassword]
    );

    return res.json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// LOGIN
const loginUser = async (req, res) => {

    console.log(process.env.JWT_SECRET, "JWT_SECRET")

  try {
    const { username, password } = req.body;

    const [users] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (users.length === 0) {
      return res.json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = users[0];

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const [users] = await pool.query(`
      SELECT id, username
      FROM users
      ORDER BY id DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    const [totalRows] = await pool.execute(
      "SELECT COUNT(*) AS total FROM users"
    );

    res.json({
      success: true,
      page,
      limit,
      total: totalRows[0].total,
      totalPages: Math.ceil(totalRows[0].total / limit),
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
};