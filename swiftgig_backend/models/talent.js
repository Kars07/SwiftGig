import mongoose from "mongoose";

const talentProfile = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    Dob: { type: Date, required: true },
    country: { type: String, required: true },
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zipCode: { type: String },
    photourl: { type: String },
    phoneNumber: {type: Number, required: true },
    portfolioPdf: { type: String },
    skills: { type: String, required: true },
    idType: { type: String, enum: ['International Passport, NiN, Driver License, Voter Card, Student Id'], required: true },
    idDocument: {type: String, required: true },
    verified: { type: Boolean, default: false },
    category: { type: String, }

});

const Talent = mongoose.model("Talent", talentProfile);
export default Talent;