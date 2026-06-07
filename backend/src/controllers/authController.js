// src/controllers/authController.js
import User from "../models/usersignup.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  console.log("👉 Register Request:", req.body);
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ Email exists");
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashPassword, role: "user" });
    await newUser.save();
    console.log("✅ User Registered:", newUser._id);

    return res.status(201).json({
      message: "Successfully registered",
      user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    console.error("❌ Register Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  console.log("👉 Login Request:", req.body.email);
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Invalid Password");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    console.log("✅ Login Successful for:", user.username);

    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: error.message });
  }
};
