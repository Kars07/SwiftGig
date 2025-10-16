import { updateProfile } from "./profileController.js";

export const talentProfileUpdate = async (req, res) => {
  await updateProfile(req, res, "talent");
};
