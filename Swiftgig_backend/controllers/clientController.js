import { updateProfile } from "./profileController.js";

export const clientProfileUpdate = async (req, res) => {
  await updateProfile(req, res, "client");
};
