import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { userRoleEnum } from "../enums/role.js";

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(userRoleEnum) },
    emailVerificationOtp: { type: String },
    otpExpiresIn: { type: Date },
    isEmailVerified: { type: Boolean, default: false }
}, { timestamps: true });

//hash password
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
