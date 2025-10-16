import { updateProfile } from "./profileController.js";
import Client from "../models/client.js";

// Get Client Profile
export const getClientProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const client = await Client.findOne({ user: userId }).populate('user');
    
    if (!client) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    res.status(200).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update or Create Client Profile
export const clientProfileUpdate = async (req, res) => {
  await updateProfile(req, res, "client");
};