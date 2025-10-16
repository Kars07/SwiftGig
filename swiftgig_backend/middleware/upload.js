// middleware/upload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.mimetype.split("/")[1];
    const folder =
      file.fieldname === "portfolioPdf"
        ? "portfolios"
        : file.fieldname === "idDocument"
        ? "ids"
        : "profiles";

    return {
      folder,
      public_id: crypto.randomBytes(16).toString("hex"),
      format: ext === "pdf" ? "pdf" : undefined,
      resource_type: ext === "pdf" ? "raw" : "image",
    };
  },
});

const upload = multer({ storage });

export default upload;
