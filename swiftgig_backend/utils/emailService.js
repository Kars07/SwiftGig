import nodemailer from "nodemailer";
import crypto from "crypto";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
   port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (user) => {
  // generate a random 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // set OTP and expiry (5 minutes from now)
  user.emailVerificationOtp = otp;
  user.otpExpiresIn = Date.now() + 5 * 60 * 1000;
  await user.save();

  // send the email
  const mailOptions = {
    from: `"SwiftGig" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Verify Your SwiftGig Email",
    html: `
      <h2>Verify Your Email</h2>
      <p>Hello ${user.firstName},</p>
      <p>Your verification code is:</p>
      <h3 style="letter-spacing: 3px;">${otp}</h3>
      <p>This code will expire in 5 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  return true;
};
