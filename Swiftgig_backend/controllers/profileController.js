import Talent from "../models/talent.js";
import Client from "../models/client.js";

export const updateProfile = async (req, res, role) => {
  try {
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ success: false, message: "userId is required" });

    const {
      Dob,
      country,
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      skills,
      category,
      idType,
    } = req.body;

    const photoUrl = req.files?.photo?.[0]?.path;
    const idDocumentUrl = req.files?.idDocument?.[0]?.path;
    const portfolioPdfUrl = req.files?.portfolioPdf?.[0]?.path;

    let updateData = {
      Dob,
      country,
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      idType,
      ...(photoUrl && { photourl: photoUrl }),
      ...(idDocumentUrl && { idDocument: idDocumentUrl }),
    };

    if (role === "talent") {
      updateData = {
        ...updateData,
        skills,
        category,
        ...(portfolioPdfUrl && { portfolioPdf: portfolioPdfUrl }),
      };

      const updatedTalent = await Talent.findOneAndUpdate(
        { user: userId },
        updateData,
        { new: true, upsert: true }
      );

      return res.status(200).json({
        success: true,
        message: "Talent profile updated successfully",
        data: updatedTalent,
      });
    }

    if (role === "client") {
      const updatedClient = await Client.findOneAndUpdate(
        { user: userId },
        updateData,
        { new: true, upsert: true }
      );

      return res.status(200).json({
        success: true,
        message: "Client profile updated successfully",
        data: updatedClient,
      });
    }

    return res.status(400).json({ success: false, message: "Invalid role" });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
