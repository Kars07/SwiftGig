import User from "../models/User.js";
import { sendVerificationEmail } from "../utils/emailService.js";
import bcrypt from "bcryptjs";

export const registerTalent = async (req, res) => {
  await handleRegister(req, res, "Talent");
};

export const registerClient = async (req, res) => {
  await handleRegister(req, res, "Client");
};

const handleRegister = async (req, res, role) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });

        await sendVerificationEmail(user);

        res.status(201).json({
            message: "User registered!",
            userId: user._id,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//email verification
export const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.isEmailVerified)
            return res.status(400).json({ message: "Email already verified" });

        if (!user.emailVerificationOtp || !user.otpExpiresIn)
            return res.status(400).json({ message: "no verification code found" });
        //check expiry
        if (Date.now() > user.otpExpiresIn)
            return res.status(400).json({message: "verification code expired"});

        //check match
        if (user.emailVerificationOtp !== otp)
            return res.status(400).json({ message: "Invalid verification code" });

        //verified 
        user.isEmailVerified = true;
        user.emailVerificationOtp = null;
        user.otpExpiresIn = null;
        await user.save();

        res.status(200).json({ message: "Email verified sucessfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ success: false, message: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};