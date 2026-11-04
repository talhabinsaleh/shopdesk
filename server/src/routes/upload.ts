import { Router } from "express";
import multer from "multer";
import { requireUser } from "../middleware/auth.js";
import { HttpError } from "../lib/validate.js";

const MAX_SIZE = 5 * 1024 * 1024;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_SIZE, files: 1 } });

// Runs on the server so the imgbb API key is never sent to the browser
const router = Router();

router.post("/", requireUser, upload.single("image"), async (req, res) => {
  const key = process.env.IMGBB_API_KEY;
  if (!key) throw new HttpError(503, "Image upload is not set up yet. Please paste an image URL.");
  const file = req.file;
  if (!file || !file.mimetype.startsWith("image/")) throw new HttpError(400, "Please choose an image file.");

  const form = new FormData();
  form.append("image", new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }), file.originalname);
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, { method: "POST", body: form });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.data?.url) throw new HttpError(502, "Upload failed. Please try again or paste an image URL.");
  res.json({ url: data.data.url });
});

export default router;
