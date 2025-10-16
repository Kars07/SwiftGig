import { updateProfile } from "./profileController.js";
import Talent from "../models/talent.js";

// Get Talent Profile
export const getTalentProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const talent = await Talent.findOne({ user: userId }).populate("user");

    if (!talent) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    res.status(200).json({ success: true, data: talent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update or Create Talent Profile
export const talentProfileUpdate = async (req, res) => {
  await updateProfile(req, res, "talent");
};