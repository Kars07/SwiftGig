import mongoose from "mongoose";
const clientProfile = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    photourl: { type: String },
    Dob: { type: Date, required: true },
    country: { type: String, required: true },
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zipCode: { type: String },
    phoneNumber: {type: Number, required: true },
    idType: { type: String, enum: ['International Passport, NiN, Driver License, Voter Card'], required: true },
    idDocument: {type: String, required: true },
    verified: { type: Boolean, default: false },
});

const Client = mongoose.model("Client", clientProfile);
export default Client;