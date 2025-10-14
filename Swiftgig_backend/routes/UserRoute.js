import express from "express";
import { registerTalent, registerClient, verifyEmail, login } from "../controllers/userController.js";

const router = express.Router();

router.post("/register-talent", registerTalent);
router.post("/register-client", registerClient);
router.post("/verifyEmail", verifyEmail);
router.post("/login", login);

export default router;