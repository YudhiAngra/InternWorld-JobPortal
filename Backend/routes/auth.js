const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/user");

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body; // ✅ added username

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username, // ✅ save username
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username, // ✅ return username
        role: newUser.role,
        email: newUser.email,
      },
    });

  } catch (err) {
    res.status(500).json({ error: "Error saving user" });
  }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    req.session.user = {
      id: user._id,
      username: user.username, // ✅ added
      role: user.role,
      email: user.email,
    };

    res.json({
      success: true,
      message: "Login successful",
      user: req.session.user,
    });

  } catch (err) {
    console.log(err);
    
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// ================= LOGOUT =================
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }

    res.clearCookie("interworld.sid", {
      httpOnly: true,
      sameSite: "lax",
    });

    res.json({ success: true });
  });
});


// ================= GET CURRENT USER =================
router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  res.json(req.session.user);
});

module.exports = router;