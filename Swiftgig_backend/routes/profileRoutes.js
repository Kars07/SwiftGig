
import express from "express";
import upload from "../middleware/upload.js";
import { updateProfile } from "../controllers/profileController.js";

const router = express.Router();

router.post(
  "/update-profile",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "idDocument", maxCount: 1 },
    { name: "portfolioPdf", maxCount: 1 },
  ]),
  updateProfile
);

export default router;
