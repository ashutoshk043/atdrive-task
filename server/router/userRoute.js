const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getAllUsers
} = require("../controller/userController");

router.get("/user-test", (req, res) => {
  res.send("User-Test Success!!");
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get('/get-user', getAllUsers)

module.exports = router;