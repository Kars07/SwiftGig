import express from "express";
import upload from "../middleware/upload.js";
import { talentProfileUpdate } from "../controllers/talentController.js";

const router = express.Router();

router.post(
  "/talentprofile",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "idDocument", maxCount: 1 },
    { name: "portfolioPdf", maxCount: 1 },
  ]),
  talentProfileUpdate
);

export default router;