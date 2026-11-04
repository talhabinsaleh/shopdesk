import { Router } from "express";

// Public: tells the website which optional features this server has set up
const router = Router();

router.get("/", (_req, res) => {
  res.json({ googleLogin: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) });
});

export default router;
