import express from "express";
import upload from "../middleware/upload.js";
import { clientProfileUpdate } from "../controllers/clientController.js";

const router = express.Router();

router.post(
  "/clientprofile",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "idDocument", maxCount: 1 },
  ]),
  clientProfileUpdate
);

export default router;