import express from "express";
import multer from "multer";
import { ingestFile } from "../services/ingest.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.post(
  "/upload",
  upload.single("pdf"),
  async (req, res) => {

    try {

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file provided",
        });
      }

      const chunks =
        await ingestFile(req.file.path, req.file.originalname);

      res.json({
        success: true,
        chunks: chunks.length,
      });

    } catch (error) {

      console.error("Upload error:", error);

      res.status(500).json({
        success: false,
        message: "Upload failed",
      });
    }
  }
);

export default router;
